package com.service.auction.service;

import com.service.auction.dto.BidHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BidHistoryService {
    Page<BidHistoryResponse> getBidHistoriesByProductId(Long productId, Pageable pageable);
}


