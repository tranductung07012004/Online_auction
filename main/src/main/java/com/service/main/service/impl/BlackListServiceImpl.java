package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.constants.KafkaEventTypes;
import com.service.main.constants.KafkaTopics;
import com.service.main.dto.BlackListEvent;
import com.service.main.dto.BlackListResponse;
import com.service.main.dto.UserEmailResponse;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.entity.AutoBid;
import com.service.main.entity.BlackList;
import com.service.main.entity.Product;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.AutoBidRepository;
import com.service.main.repository.BlackListRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.BlackListService;
import com.service.main.service.KafkaProducerService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

@Service
@RequiredArgsConstructor
public class BlackListServiceImpl implements BlackListService {

    private final BlackListRepository blackListRepository;
    private final UserServiceClient userServiceClient;
    private final ProductRepository productRepository;
    private final AutoBidRepository autoBidRepository;
    private final KafkaProducerService kafkaProducerService;

    @Override
    public Page<BlackListResponse> getBlackListsByProductId(Long productId, Pageable pageable) {
        Page<BlackList> blackListPage = this.blackListRepository.findByProductId(productId, pageable);
        return blackListPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public BlackListResponse blockUser(Long userId, Long productId, Long createdBy) {
        UserInfoResponse userInfo = userServiceClient.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "User not found");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        // Check if auction has ended
        OffsetDateTime now = OffsetDateTime.now();
        if (product.getEndAt().isBefore(now)) {
            throw new ApplicationException(ErrorCodes.INVALID_OPERATION, "Cannot block user: auction has ended");
        }

        boolean alreadyBlocked = blackListRepository.existsByBidderIdAndProductId(userId, productId);
        if (alreadyBlocked) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, "User is already blocked for this product");
        }

        // Check if user being blocked is the top bidder, can check lai xu li logic cua cai nay
        if (product.getTopBidderId() != null && product.getTopBidderId().equals(userId)) {
            // Find the second highest auto bid (excluding the blocked user)
            List<AutoBid> autoBids = autoBidRepository.findByProductIdExcludingBidderOrderByMaxPriceDesc(productId, userId);
            
            if (!autoBids.isEmpty()) {
                // Get the first one (highest max price after excluding the blocked user)
                AutoBid secondHighestAutoBid = autoBids.get(0);
                product.setTopBidderId(secondHighestAutoBid.getBidderId());
                product.setCurrentPrice(secondHighestAutoBid.getMaxPrice());
                this.productRepository.save(product);
            } else {
                // No other auto bids, set top bidder to null and current price to start price
                product.setTopBidderId(null);
                product.setCurrentPrice(product.getStartPrice());
                this.productRepository.save(product);
            }
        }

        BlackList blackList = BlackList.builder()
                .bidderId(userId)
                .productId(productId)
                .createdBy(createdBy)
                .createdAt(now)
                .build();

        BlackList savedBlackList = this.blackListRepository.save(blackList);
        
        // Get bidder email and send Kafka event
        String bidderEmail = null;
        try {
            UserEmailResponse userEmailResponse = userServiceClient.getUserEmail(userId);
            if (userEmailResponse != null) {
                bidderEmail = userEmailResponse.getEmail();
            }
        } catch (Exception e) {
            // Log error but don't fail the block operation
            // Email might be null if user service is unavailable
        }
        
        // Send Kafka event to worker
        BlackListEvent eventPayload = BlackListEvent.builder()
                .productId(productId)
                .bidderId(userId)
                .bidderEmail(bidderEmail)
                .build();
        
        kafkaProducerService.sendMessage(
                KafkaTopics.BIDDING_PROCESS_SIDE_EVENT,
                KafkaEventTypes.BLACK_LIST,
                eventPayload
        );
        
        return mapToResponse(savedBlackList);
    }

    private BlackListResponse mapToResponse(BlackList blackList) {
        UserInfoResponse bidderInfoRes = userServiceClient.getUserBasicInfo(blackList.getBidderId());
        UserInfo bidder = formatUserInfo(bidderInfoRes);

        BlackListResponse response = new BlackListResponse();
        response.setId(blackList.getId());
        response.setProductId(blackList.getProductId());
        response.setBidder(bidder);
        response.setCreatedAt(blackList.getCreatedAt());
        response.setCreatedBy(blackList.getCreatedBy());
        return response;
    }
}

