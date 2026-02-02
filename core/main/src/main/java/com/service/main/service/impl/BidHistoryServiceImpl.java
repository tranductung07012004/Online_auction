package com.service.main.service.impl;

import com.service.main.dto.BidHistoryResponse;
import com.service.common.dto.UserInfo;
import com.service.common.dto.UserInfoResponse;
import com.service.main.entity.BidHistory;
import com.service.main.repository.BidHistoryRepository;
import com.service.main.service.BidHistoryService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.service.common.utils.CharacterUtils;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

@Service
@RequiredArgsConstructor
public class BidHistoryServiceImpl implements BidHistoryService {

    private final BidHistoryRepository bidHistoryRepository;
    private final UserServiceClient userServiceClient;

    @Override
    public Page<BidHistoryResponse> getBidHistoriesByProductId(Long productId, Pageable pageable) {
        Page<BidHistory> bidHistoryPage = bidHistoryRepository.findByProductId(productId, pageable);
        return bidHistoryPage.map(this::mapToResponse);
    }

    private BidHistoryResponse mapToResponse(BidHistory bidHistory) {
        UserInfoResponse bidderInfoRes = userServiceClient.getUserBasicInfo(bidHistory.getBidderId());
        UserInfo bidder = formatUserInfo(bidderInfoRes);
        
        // Mask fullname for privacy
        if (bidder != null && bidder.getFullname() != null) {
            String maskedFullname = CharacterUtils.maskFullname(bidder.getFullname());
            bidder.setFullname(maskedFullname);
        }

        BidHistoryResponse response = new BidHistoryResponse();
        response.setId(bidHistory.getId());
        response.setProductId(bidHistory.getProductId());
        response.setBidder(bidder);
        response.setPrice(bidHistory.getPrice());
        response.setCreatedAt(bidHistory.getCreatedAt());
        return response;
    }
}

