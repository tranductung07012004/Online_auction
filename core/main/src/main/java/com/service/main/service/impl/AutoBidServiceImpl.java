package com.service.main.service.impl;

import com.service.main.config.TransactionTemplateProvider;
import com.service.main.constants.ErrorCodes;
import com.service.main.dto.AutoBidResponse;
import com.service.main.dto.CreateAutoBidRequest;
import com.service.common.dto.UserInfo;
import com.service.common.dto.UserInfoResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.*;
import com.service.main.service.*;
import com.service.main.constants.KafkaTopics;
import com.service.main.constants.KafkaEventTypes;
import com.service.main.dto.ProductEndAtUpdatedEvent;
import com.service.main.dto.ProductCurrentPriceUpdatedEvent;
import com.service.common.dto.UserEmailItemResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.service.main.dto.CreateAutoBidResult;
import com.service.main.dto.BidUpdateResult;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;
import org.springframework.beans.factory.annotation.Value;


@Service
@RequiredArgsConstructor
public class AutoBidServiceImpl implements AutoBidService {

    private final AutoBidRepository autoBidRepository;
    private final ProductRepository productRepository;
    private final UserServiceClient userServiceClient;

    private final BidRequestRepository bidRequestRepository;

    private final BlackListRepository blackListRepository;

    private final BidHistoryRepository bidHistoryRepository;

    private final BidRequestService bidRequestService;

    private final SystemSettingRepository systemSettingRepository;

    private final ProductSyncEsLimitService productSyncEsLimitService;

    private final KafkaProducerService kafkaProducerService;

    private final TransactionTemplateProvider transactionTemplateProvider;

    @Value("${assessment.minimum}")
    private Double MINIMUM_ASSESSMENT;

    private void verifyUserForBidding(Long currentUserId, Long productId) {
        // Kiểm tra xem user có phải là seller của product không
        Product product = this.productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        if (currentUserId.equals(product.getSellerId())) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION,
                    "Seller id:" + currentUserId +  "cannot bid on your their product id: " + productId);
        }

        UserInfoResponse userResFromAPI = userServiceClient.getUserBasicInfo(currentUserId);
        UserInfo user  = formatUserInfo(userResFromAPI);
        if (user.getAssessment() == null) {
            // Tim trong bid_request, neu ma co record thi check xem no duoc dong y chua, neu chua dong y thi throw
            // Neu ko co record thi tao 1 record request len cho seller xem, xong roi throw.
            Optional<BidRequest> existingRequest = bidRequestRepository.findByProductIdAndBidderId(
                    productId, currentUserId);

            if (existingRequest.isPresent()) {
                BidRequest req = existingRequest.get();
                if (!req.getVerified()) {
                    throw new ApplicationException(ErrorCodes.INVALID_OPERATION,
                            "Your bid request is pending verification by seller");
                }
                // Nếu verified = true → tiếp tục (dù assessment null, nhưng đã verified)
            } else {
                // Tạo mới bid_request, su dung transaction moi tai vi ngay sau la 1 cau lenh throw
                // neu khong dung la no se rollback luon
                transactionTemplateProvider
                        .getRequiredNewReadCommitted()
                        .executeWithoutResult(
                                status ->
                        this.bidRequestService.createBidRequest(
                                currentUserId,
                                productId,
                                product.getSellerId()
                        )
                );
                throw new ApplicationException(ErrorCodes.INVALID_OPERATION,
                        "You have not been assessed. A bid request has been sent to seller for verification");
            }
        } else if (user.getAssessment() < this.MINIMUM_ASSESSMENT) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, "User assessment is less than " + this.MINIMUM_ASSESSMENT);
        }

        // If user in blacklists then cannot bid this product
        // 0.2. Kiểm tra blacklist
        boolean isBlacklisted = blackListRepository.existsByBidderIdAndProductId(currentUserId, productId);
        if (isBlacklisted) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, "You are blacklisted from bidding on this product");
        }
    }


    private BidUpdateResult handleBidCases(Product product, BigDecimal maxPrice, BigDecimal minBidStep, Long currentUserId, OffsetDateTime now) {
        Long currentTopBidderId = product.getTopBidderId();
        BigDecimal currentPrice = product.getCurrentPrice();
        BigDecimal minimumBidStep = product.getMinimumBidStep();

        if (currentTopBidderId == null) {
            // Case 4: Bid đầu tiên
            this.createBidHistory(product.getId(), currentUserId, currentPrice.add(minimumBidStep), now);
            return new BidUpdateResult(currentPrice.add(minimumBidStep), currentUserId, 1);
        }

        // Lấy top max price
        Optional<AutoBid> topAutoBidOpt = autoBidRepository.findByProductIdAndBidderId(
                product.getId(), currentTopBidderId);

        if (topAutoBidOpt.isEmpty()) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION,
                    "AutoBid for top bidder " + currentTopBidderId + " not found");
        }

        BigDecimal topMaxPrice = topAutoBidOpt.get().getMaxPrice();
        BigDecimal newPrice = currentPrice;
        Long newTopBidderId = currentTopBidderId;
        int bidIncrement = 1;

        if (maxPrice.compareTo(topMaxPrice) < 0) {
            // Case 1
            newPrice = maxPrice;
            createBidHistory(product.getId(), currentUserId, newPrice, now);
            createBidHistory(product.getId(), currentTopBidderId, newPrice, now);
            bidIncrement = 2;
        } else if (maxPrice.compareTo(topMaxPrice) > 0) {
            // Case 2
            BigDecimal raisedPrice = topMaxPrice.add(minBidStep);
            newPrice = maxPrice.compareTo(raisedPrice) <= 0 ? maxPrice : raisedPrice;
            newTopBidderId = currentUserId;
            createBidHistory(product.getId(), currentUserId, newPrice, now);
        } else {
            // Case 3
            newPrice = topMaxPrice;
            createBidHistory(product.getId(), currentUserId, newPrice, now);
        }

        return new BidUpdateResult(newPrice, newTopBidderId, bidIncrement);
    }


    private CreateAutoBidResult createAutoBidTx(
            CreateAutoBidRequest request,
            Long currentUserId,
            OffsetDateTime now
    ) {
        Product product = this.productRepository.findByIdWithLock(request.getProductId())
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        // 1. Kiểm tra endAt
        if (now.isAfter(product.getEndAt())) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, "Auction has ended");
        }

        BigDecimal maxPrice = request.getMaxPrice();
        BigDecimal startPrice = product.getStartPrice();
        BigDecimal currentPrice = product.getCurrentPrice();
        BigDecimal minBidStep = product.getMinimumBidStep();
        BigDecimal buyNowPrice = product.getBuyNowPrice();
        OffsetDateTime endAt = product.getEndAt();
        Long oldTopBidderId = product.getTopBidderId();
        Long sellerId = product.getSellerId();

        // . Buy now trigger
        if (buyNowPrice != null && maxPrice.compareTo(buyNowPrice) >= 0) {
            product.setTopBidderId(currentUserId);
            product.setCurrentPrice(buyNowPrice);
            product.setBidCount(product.getBidCount() + 1);
            product.setEndAt(now);
            this.productRepository.save(product);

            this.createBidHistory(product.getId(), currentUserId, buyNowPrice, now);

            AutoBid autoBidRes =  this.createOrUpdateAutoBid(product.getId(), currentUserId, maxPrice, now);
            return new CreateAutoBidResult(
                    autoBidRes,
                    true,
                    buyNowPrice.compareTo(currentPrice) != 0,
                    buyNowPrice,
                    now,
                    oldTopBidderId,
                    sellerId,
                    oldTopBidderId == null ? true : oldTopBidderId != currentUserId,
                    currentUserId
            );
        }

        if (product.getTopBidderId() != null && currentUserId == product.getTopBidderId()) {
            // new max price >= old max price else throw
            // Khong tang bid count
            // khong tao bid history
            // top bidder id khong doi
            // currentprice khong doi 
            // end at khong doi 
            // No handling for endAt auto extend, otherwise user will use this as a trick to forever extend time.
            // chi co autobid.maxPrice la co thay doi 
            // return ngay tai day 
            AutoBid bidderAutoBid = this.autoBidRepository
            .findByProductIdAndBidderId(request.getProductId(), currentUserId)
            .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, 
                "Auto bid for user id: " + currentUserId + 
                " and productId: " + request.getProductId() + " not found"));
            if (maxPrice.compareTo(bidderAutoBid.getMaxPrice()) <= 0) {
                throw new ApplicationException(ErrorCodes.VALIDATION_FAILED, 
                    "You cannot place bid less than or equal to last time"
                );
            }
            AutoBid autoBidRes =  this.createOrUpdateAutoBid(request.getProductId(), currentUserId, maxPrice, now);

            return new CreateAutoBidResult(
                autoBidRes,
                false, 
                false, 
                currentPrice,
                endAt,
                oldTopBidderId,
                sellerId,
                false,
                currentUserId
            );
        }

        // 2. Validate max_price
        if (product.getBidCount() == 0) {
            if (maxPrice.compareTo(startPrice) < 0) {
                throw new ApplicationException(
                        ErrorCodes.INVALID_INPUT,
                        "Max price must be at least equal to start price"
                );
            }
        } else if (product.getBidCount() > 0) {
            BigDecimal minRequired = currentPrice.add(minBidStep);
            if (maxPrice.compareTo(minRequired) < 0) {
                throw new ApplicationException(
                        ErrorCodes.INVALID_INPUT,
                        "Max price must be at least current price + bid step (" + minRequired + ")"
                );
            }
        } else {
            throw new ApplicationException(
                    ErrorCodes.VALIDATION_FAILED,
                    "Product " + product.getId() + "has bid_count < 0, error data"
            );
        }

        BidUpdateResult result = handleBidCases(product, maxPrice, minBidStep, currentUserId, now);

        // Handle auto extend if enabled
        OffsetDateTime newEndAt = this.calculateEndAt(product, now);

        // 6. Cập nhật product
        product.setEndAt(newEndAt);
        product.setCurrentPrice(result.newCurrentPrice);
        product.setTopBidderId(result.newTopBidderId);
        product.setBidCount(product.getBidCount() + result.bidCountIncrement);
        productRepository.save(product);

        AutoBid autoBidRes = this.createOrUpdateAutoBid(product.getId(), currentUserId, maxPrice, now);
        return new CreateAutoBidResult(
                autoBidRes,
                newEndAt != endAt,
                result.newCurrentPrice.compareTo(currentPrice) != 0,
                result.newCurrentPrice,
                newEndAt,
                oldTopBidderId,
                sellerId,
                oldTopBidderId == null ? true : oldTopBidderId != result.newTopBidderId,
                result.newTopBidderId
        );
    }

    @Override
    public AutoBidResponse createAutoBid(CreateAutoBidRequest request, Long currentUserId) {
        OffsetDateTime now = OffsetDateTime.now();
        verifyUserForBidding(currentUserId, request.getProductId());

        CreateAutoBidResult res = transactionTemplateProvider.getRequiredReadCommitted().execute(
                status -> this.createAutoBidTx(request, currentUserId,  now)
        );

        if (res != null && res.hasEndAtChange) {
            System.out.println("hahahaha123123123");
            // send event END_AT CHANGE TO WORKER
            ProductEndAtUpdatedEvent endAtEvent = ProductEndAtUpdatedEvent.builder()
                    .productId(request.getProductId())
                    .newEndAt(res.newEndAt)
                    .build();

            kafkaProducerService.sendMessage(
                    KafkaTopics.SYNC_PRODUCT_ENTITY_TO_ES,
                    KafkaEventTypes.UPDATE_PRODUCT_END_AT,
                    endAtEvent
            );
        }
        if (res != null && res.hasCurrentPriceChange) {
            System.out.println("hahahaha456456");
            // send event current price change to worker
            // Get emails for seller, current user, and old top bidder (if exists) in one call
            List<Long> userIds = List.of(res.sellerId, currentUserId);
            if (res.oldTopBidderId != null) {
                userIds = List.of(res.sellerId, currentUserId, res.oldTopBidderId);
            }
            
            List<UserEmailItemResponse> emailResponses = userServiceClient.getUserEmails(userIds);
            Map<Long, String> emailMap = emailResponses.stream()
                    .collect(Collectors.toMap(
                            UserEmailItemResponse::getUserId,
                            UserEmailItemResponse::getEmail
                    ));
            
            String sellerEmail = emailMap.get(res.sellerId);
            String userCreateBidEmail = emailMap.get(currentUserId);
            String oldTopBidderEmail = res.oldTopBidderId != null ? emailMap.get(res.oldTopBidderId) : null;
            
            ProductCurrentPriceUpdatedEvent currentPriceEvent = ProductCurrentPriceUpdatedEvent.builder()
                    .productId(request.getProductId())
                    .newCurrentPrice(res.newCurrentPrice)
                    .sellerId(res.sellerId)
                    .oldTopBidderId(res.oldTopBidderId)
                    .userCreateBidId(currentUserId)
                    .newTopBidderId(res.newTopBidderId)
                    .sellerEmail(sellerEmail)
                    .userCreateBidEmail(userCreateBidEmail)
                    .oldTopBidderEmail(oldTopBidderEmail)
                    .build();

            kafkaProducerService.sendMessage(
                    KafkaTopics.SYNC_PRODUCT_ENTITY_TO_ES,
                    KafkaEventTypes.UPDATE_PRODUCT_CURRENT_PRICE, 
                    currentPriceEvent
            );

            this.productSyncEsLimitService.updateLastCurPriceChangeAt(request.getProductId(), now);
        }

        return mapToResponse(res == null ? null : res.autoBidRes);
    }

    private void createBidHistory(Long productId, Long bidderId, BigDecimal price, OffsetDateTime createdAt) {
        BidHistory history = BidHistory.builder()
                .productId(productId)
                .bidderId(bidderId)
                .price(price)
                .createdAt(createdAt)
                .build();
        this.bidHistoryRepository.save(history);
    }

    private AutoBid createOrUpdateAutoBid(
            Long productId,
            Long bidderId,
            BigDecimal maxPrice,
            OffsetDateTime now
    ) {
        Optional<AutoBid> existing = this.autoBidRepository.findByProductIdAndBidderId(productId, bidderId);
        AutoBid autoBid;
        if (existing.isPresent()) {
            autoBid = existing.get();
            autoBid.setMaxPrice(maxPrice);
            autoBid.setUpdatedAt(now);
        } else {
            autoBid = AutoBid.builder()
                    .productId(productId)
                    .bidderId(bidderId)
                    .maxPrice(maxPrice)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
        }
        return this.autoBidRepository.save(autoBid);
    }

    @Override
    public Page<AutoBidResponse> getAutoBidsByProductId(Long productId, Pageable pageable) {
        // Lấy danh sách bidderId trong blacklist cho product này
        List<BlackList> blackLists = this.blackListRepository.findByProductIdReturnList(productId);
        List<Long> blacklistedBidderIds = blackLists.stream()
                .map(BlackList::getBidderId)
                .collect(Collectors.toList());

        Page<AutoBid> autoBidPage;
        if (blacklistedBidderIds.isEmpty()) {
            // Nếu không có blacklist, query bình thường
            autoBidPage = this.autoBidRepository.findByProductId(productId, pageable);
        } else {
            // Nếu có blacklist, exclude các bidderId đó
            autoBidPage = this.autoBidRepository.findByProductIdExcludingBidderIds(productId, blacklistedBidderIds, pageable);
        }

        return autoBidPage.map(this::mapToResponse);
    }

    @Override
    public boolean canUserBid(Long userId, Long productId) {
        verifyUserForBidding(userId, productId);
        return true;
    }

    private OffsetDateTime calculateEndAt(Product product, OffsetDateTime now) {

        if (product.getAutoExtendEnabled() ==  null) return product.getEndAt();
        if (!product.getAutoExtendEnabled()) return product.getEndAt();
        Optional<SystemSetting> autoExtendSetting = systemSettingRepository.findByKey("autoExtendEnable");
        if (autoExtendSetting.isEmpty()) return product.getEndAt();

        SystemSetting setting = autoExtendSetting.get();
        JsonNode value = setting.getValue();

        if (!value.has("format")
                || !value.has("timeExtend")
                || !value.has("timeLeftToExtend")
        ) {
            return product.getEndAt();
        }

        String format = value.get("format").asText().toLowerCase();
        int timeExtend = value.get("timeExtend").asInt();
        int timeLeftToExtend = value.get("timeLeftToExtend").asInt();

        OffsetDateTime productEndAt = product.getEndAt();

        // Tính thời gian còn lại của auction
        Duration timeRemaining = Duration.between(now, productEndAt);

        // Chuyển đổi timeLeftToExtend sang Duration dựa trên format
        Duration thresholdDuration;
        switch (format) {
            case "minute":
                thresholdDuration = Duration.ofMinutes(timeLeftToExtend);
                break;
            case "hour":
                thresholdDuration = Duration.ofHours(timeLeftToExtend);
                break;
            case "day":
                thresholdDuration = Duration.ofDays(timeLeftToExtend);
                break;
            default:
                return productEndAt;
        }

        // Chỉ cộng thời gian nếu thời gian còn lại <= timeLeftToExtend
        if (timeRemaining.compareTo(thresholdDuration) <= 0) {
            OffsetDateTime newEndAt = productEndAt;

            // Cộng timeExtend vào endAt
            switch (format) {
                case "minute":
                    newEndAt = newEndAt.plusMinutes(timeExtend);
                    break;
                case "hour":
                    newEndAt = newEndAt.plusHours(timeExtend);
                    break;
                case "day":
                    newEndAt = newEndAt.plusDays(timeExtend);
                    break;
                default:
                    return productEndAt;
            }

            return newEndAt;
        }

        return productEndAt;
    }

    private AutoBidResponse mapToResponse(AutoBid autoBid) {
        if (autoBid == null) return null;

        UserInfoResponse bidderInfoRes = userServiceClient.getUserBasicInfo(autoBid.getBidderId());
        UserInfo bidder = formatUserInfo(bidderInfoRes);

        AutoBidResponse response = new AutoBidResponse();
        response.setId(autoBid.getId());
        response.setProductId(autoBid.getProductId());
        response.setBidder(bidder);
        response.setCreatedAt(autoBid.getCreatedAt());
        response.setUpdatedAt(autoBid.getUpdatedAt());
        return response;
    }
}
