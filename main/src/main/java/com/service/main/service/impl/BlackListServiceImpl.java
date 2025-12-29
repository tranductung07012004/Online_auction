package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.BlackListResponse;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.entity.BlackList;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.BlackListRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.BlackListService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

@Service
@RequiredArgsConstructor
public class BlackListServiceImpl implements BlackListService {

    private final BlackListRepository blackListRepository;
    private final UserServiceClient userServiceClient;
    private final ProductRepository productRepository;

    @Override
    public Page<BlackListResponse> getBlackListsByProductId(Long productId, Pageable pageable) {
        Page<BlackList> blackListPage = this.blackListRepository.findByProductId(productId, pageable);
        return blackListPage.map(this::mapToResponse);
    }

    @Override
    public BlackListResponse blockUser(Long userId, Long productId, Long createdBy) {
        UserInfoResponse userInfo = userServiceClient.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "User not found");
        }

        boolean productExists = productRepository.existsById(productId);
        if (!productExists) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found");
        }

        boolean alreadyBlocked = blackListRepository.existsByBidderIdAndProductId(userId, productId);
        if (alreadyBlocked) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, "User is already blocked for this product");
        }

        BlackList blackList = BlackList.builder()
                .bidderId(userId)
                .productId(productId)
                .createdBy(createdBy)
                .createdAt(OffsetDateTime.now())
                .build();

        BlackList savedBlackList = blackListRepository.save(blackList);
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

