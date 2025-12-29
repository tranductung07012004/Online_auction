package com.service.main.service;

import com.service.main.dto.AutoBidResponse;
import com.service.main.dto.CreateAutoBidRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AutoBidService {
    AutoBidResponse createAutoBid(CreateAutoBidRequest request, Long currentUserId);
    Page<AutoBidResponse> getAutoBidsByProductId(Long productId, Pageable pageable);
    boolean canUserBid(Long userId, Long productId);
}
