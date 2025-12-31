package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.AutoBidResponse;
import com.service.main.dto.CreateAutoBidRequest;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.service.main.entity.AutoBid;
import com.service.main.entity.BidHistory;
import com.service.main.entity.BidRequest;
import com.service.main.entity.Product;
import com.service.main.entity.SystemSetting;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.*;
import com.service.main.service.AutoBidService;
import com.service.main.service.BidRequestService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;

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
                // Tạo mới bid_request
                this.bidRequestService.createBidRequest(currentUserId, productId, product.getSellerId());
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

    private static class BidUpdateResult {
        BigDecimal newCurrentPrice;
        Long newTopBidderId;
        int bidCountIncrement;

        BidUpdateResult(BigDecimal newPrice, Long newTopId, int increment) {
            this.newCurrentPrice = newPrice;
            this.newTopBidderId = newTopId;
            this.bidCountIncrement = increment;
        }
    }

    private BidUpdateResult handleBidCases(Product product, BigDecimal maxPrice, BigDecimal minBidStep, Long currentUserId, OffsetDateTime now) {
        Long currentTopBidderId = product.getTopBidderId();
        BigDecimal currentPrice = product.getCurrentPrice();

        if (currentTopBidderId == null) {
            // Case 4: Bid đầu tiên
            createBidHistory(product.getId(), currentUserId, maxPrice, now);
            return new BidUpdateResult(maxPrice, currentUserId, 1);
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


    @Override
    @Transactional()
    public AutoBidResponse createAutoBid(CreateAutoBidRequest request, Long currentUserId) {
        verifyUserForBidding(currentUserId, request.getProductId());

        Product product = this.productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        OffsetDateTime now = OffsetDateTime.now();

        // 1. Kiểm tra endAt
        if (now.isAfter(product.getEndAt())) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, "Auction has ended");
        }

        BigDecimal maxPrice = request.getMaxPrice();
        BigDecimal startPrice = product.getStartPrice();
        BigDecimal currentPrice = product.getCurrentPrice();
        BigDecimal minBidStep = product.getMinimumBidStep();
        BigDecimal buyNowPrice = product.getBuyNowPrice();

        // 2. Validate max_price
        if (product.getBidCount() == 0) {
            if (maxPrice.compareTo(startPrice) < 0) {
                throw new ApplicationException(ErrorCodes.INVALID_INPUT, "Max price must be at least equal to start price");
            }
        } else if (product.getBidCount() > 0) {
            BigDecimal minRequired = currentPrice.add(minBidStep);
            if (maxPrice.compareTo(minRequired) < 0) {
                throw new ApplicationException(ErrorCodes.INVALID_INPUT,
                        "Max price must be at least current price + bid step (" + minRequired + ")");
            }
        } else {
            throw new ApplicationException(ErrorCodes.VALIDATION_FAILED, "Product " + product.getId() + "has bid_count < 0, error data");
        }

        // 3. Buy now trigger
        if (buyNowPrice != null && maxPrice.compareTo(buyNowPrice) >= 0) {
            product.setTopBidderId(currentUserId);
            product.setCurrentPrice(buyNowPrice);
            product.setBidCount(product.getBidCount() + 1);
            product.setEndAt(now);
            this.productRepository.save(product);

            this.createBidHistory(product.getId(), currentUserId, buyNowPrice, now);

            AutoBid autoBid = this.createOrUpdateAutoBid(product.getId(), currentUserId, maxPrice, now);
            
            // Handle auto extend if enabled
            handleAutoExtend(product);
            
            return mapToResponse(autoBid);
        }

        // 4. Xử lý auto bid
        AutoBid autoBid = this.createOrUpdateAutoBid(product.getId(), currentUserId, maxPrice, now);

        BidUpdateResult result = handleBidCases(product, maxPrice, minBidStep, currentUserId, now);

        // 6. Cập nhật product
        product.setCurrentPrice(result.newCurrentPrice);
        product.setTopBidderId(result.newTopBidderId);
        product.setBidCount(product.getBidCount() + result.bidCountIncrement);
        productRepository.save(product);

        // Handle auto extend if enabled
        this.handleAutoExtend(product);

        return mapToResponse(autoBid);
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

    private AutoBid createOrUpdateAutoBid(Long productId, Long bidderId, BigDecimal maxPrice, OffsetDateTime now) {
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
        Page<AutoBid> autoBidPage = this.autoBidRepository.findByProductId(productId, pageable);
        return autoBidPage.map(this::mapToResponse);
    }

    @Override
    public boolean canUserBid(Long userId, Long productId) {
        verifyUserForBidding(userId, productId);
        return true;
    }

    private void handleAutoExtend(Product product) {
        if (product.getAutoExtendEnabled() != null && product.getAutoExtendEnabled()) {
            Optional<SystemSetting> autoExtendSetting = systemSettingRepository.findByKey("autoExtendEnable");
            
            if (autoExtendSetting.isPresent()) {
                SystemSetting setting = autoExtendSetting.get();
                JsonNode value = setting.getValue();
                
                if (value.has("format") && value.has("timeExtend") && value.has("timeLeftToExtend")) {
                    String format = value.get("format").asText().toLowerCase();
                    int timeExtend = value.get("timeExtend").asInt();
                    int timeLeftToExtend = value.get("timeLeftToExtend").asInt();
                    
                    OffsetDateTime now = OffsetDateTime.now();
                    OffsetDateTime endAt = product.getEndAt();
                    
                    // Tính thời gian còn lại của auction
                    Duration timeRemaining = Duration.between(now, endAt);
                    
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
                            return;
                    }
                    
                    // Chỉ cộng thời gian nếu thời gian còn lại <= timeLeftToExtend
                    if (timeRemaining.compareTo(thresholdDuration) <= 0) {
                        OffsetDateTime newEndAt = endAt;
                        
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
                                return;
                        }
                        
                        product.setEndAt(newEndAt);
                        this.productRepository.save(product);
                    }
                }
            }
        }
    }

    private AutoBidResponse mapToResponse(AutoBid autoBid) {
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
