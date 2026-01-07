package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.CreateReviewRequest;
import com.service.main.dto.ReviewResponse;
import com.service.main.service.ReviewService;
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

        return ResponseEntity.status(201)
                .body(new ApiResponse<>("Review created successfully", res));
    }

    @GetMapping
    public ResponseEntity<?> getReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = this.reviewService.getReviewsBySenderId(currentUserId, pageable);

        return ResponseEntity.ok(
                new ApiResponse<>("Reviews retrieved successfully", reviews)
        );
    }
}

