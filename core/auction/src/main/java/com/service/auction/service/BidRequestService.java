package com.service.auction.service;

import com.service.auction.dto.BidRequestResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BidRequestService {
    void createBidRequest(Long bidderId, Long productId, Long sellerId);
    Page<BidRequestResponse> getBidRequestsByProductId(Long productId, Pageable pageable);
    BidRequestResponse verifyBidRequest(Long bidderId, Long productId, Long sellerId);
}
