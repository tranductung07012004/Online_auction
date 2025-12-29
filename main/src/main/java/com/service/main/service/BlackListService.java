package com.service.main.service;

import com.service.main.dto.BlackListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BlackListService {
    Page<BlackListResponse> getBlackListsByProductId(Long productId, Pageable pageable);
    BlackListResponse blockUser(Long userId, Long productId, Long createdBy);
}

