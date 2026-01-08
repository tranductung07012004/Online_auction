package com.service.main.service;

import com.service.main.dto.CreateReviewRequest;
import com.service.main.dto.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(CreateReviewRequest request, Long senderId);
    
    Page<ReviewResponse> getReviewsBySenderId(Long senderId, Pageable pageable);
}

