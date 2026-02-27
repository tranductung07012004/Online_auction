package com.service.product.controller;

import com.service.common.dto.ApiResponse;
import com.service.product.dto.review.request.CreateReviewRequest;
import com.service.product.dto.review.response.ReviewResponse;
import com.service.product.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest req
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        ReviewResponse res = this.reviewService.createReview(req, currentUserId);

        return ResponseEntity
        .status(201)
                .body(new ApiResponse<>("Review created successfully", res));
    }

    @GetMapping("sender")
    public ResponseEntity<?> getReviewsBySenderId(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = this.reviewService.getReviewsBySenderId(currentUserId, pageable);

        return ResponseEntity
                .status(200)
                .body(
                        new ApiResponse<>("Reviews retrieved successfully", reviews)
                );
    }
    @GetMapping("receiver")
    public ResponseEntity<?> getReviewsByReceiverId(
        @RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "10") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        Pageable pageable = PageRequest.of(page, size);
        
        Page<ReviewResponse> reviews = this.reviewService.getReviewsByReceiverId(currentUserId, pageable);

        return ResponseEntity
                .status(200)
                .body(
                        new ApiResponse<>("Reviews retrieved successfully", reviews)
                );
    }

    @GetMapping("/public/user/{userId}")
    public ResponseEntity<?> getReviewsByReceiverIdPublic(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "0") int page, 
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        
        Page<ReviewResponse> reviews = this.reviewService.getReviewsByReceiverId(userId, pageable);

        return ResponseEntity
                .status(200)
                .body(
                        new ApiResponse<>("Reviews retrieved successfully", reviews)
                );
    }
}

