package com.service.main.service;

import com.service.main.dto.BidHistoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BidHistoryService {
    Page<BidHistoryResponse> getBidHistoriesByProductId(Long productId, Pageable pageable);
}


