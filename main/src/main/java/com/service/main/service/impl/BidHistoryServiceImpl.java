package com.service.main.service.impl;

import com.service.main.dto.BidHistoryResponse;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.entity.BidHistory;
import com.service.main.repository.BidHistoryRepository;
import com.service.main.service.BidHistoryService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
            String maskedFullname = maskFullname(bidder.getFullname());
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

    private String maskFullname(String fullname) {
        if (fullname == null || fullname.trim().isEmpty()) {
            return fullname;
        }
        
        String trimmed = fullname.trim();
        String[] nameParts = trimmed.split("\\s+");
        
        if (nameParts.length == 0) {
            return trimmed;
        }
        
        StringBuilder masked = new StringBuilder();
        
        for (int i = 0; i < nameParts.length - 1; i++) {
            if (i > 0) {
                masked.append(" ");
            }
            masked.append("*".repeat(nameParts[i].length()));
        }
        
        String lastName = nameParts[nameParts.length - 1];
        if (lastName.length() == 1) {
            if (masked.length() > 0) {
                masked.append(" ");
            }
            masked.append(lastName);
        } else {
            if (masked.length() > 0) {
                masked.append(" ");
            }
            masked.append(maskLastName(lastName));
        }
        
        return masked.toString();
    }
    
    private String maskLastName(String lastName) {
        if (lastName == null || lastName.length() <= 1) {
            return lastName;
        }
        
        int length = lastName.length();
        if (length == 2) {
            return lastName.charAt(0) + "*";
        } else {
            StringBuilder masked = new StringBuilder();
            masked.append(lastName.charAt(0));
            for (int i = 1; i < length - 1; i++) {
                masked.append("*");
            }
            masked.append(lastName.charAt(length - 1));
            return masked.toString();
        }
    }
}

