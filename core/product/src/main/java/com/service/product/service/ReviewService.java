package com.service.product.service;

import com.service.product.dto.review.request.CreateReviewRequest;
import com.service.product.dto.review.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(CreateReviewRequest request, Long senderId);
    
    Page<ReviewResponse> getReviewsBySenderId(Long senderId, Pageable pageable);
    
    Page<ReviewResponse> getReviewsByReceiverId(Long receiverId, Pageable pageable);
}

