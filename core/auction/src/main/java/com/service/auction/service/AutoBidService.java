package com.service.auction.service;


import com.service.auction.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AutoBidService {
    AutoBidResponse createAutoBid(CreateAutoBidRequest request, Long currentUserId);
    Page<AutoBidResponse> getAutoBidsByProductId(Long productId, Pageable pageable);
    boolean canUserBid(Long userId, Long productId);
}
