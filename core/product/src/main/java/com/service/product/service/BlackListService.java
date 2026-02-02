package com.service.product.service;

import com.service.product.dto.blacklist.response.BlackListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BlackListService {
    Page<BlackListResponse> getBlackListsByProductId(Long productId, Pageable pageable);
    BlackListResponse blockUser(Long userId, Long productId, Long createdBy);
}

