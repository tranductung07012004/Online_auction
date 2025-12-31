package com.service.user.controller;

import com.service.user.dto.ApiResponse;
import com.service.user.dto.CreateSellerRequestDTO;
import com.service.user.dto.SellerRequestResponse;
import com.service.user.service.SellerRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/seller-request")
@RequiredArgsConstructor
@Slf4j
public class SellerRequestController {

    private final SellerRequestService sellerRequestService;

    /**
     * Create a new seller request
     */
    @PostMapping
    public ResponseEntity<?> createSellerRequest(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateSellerRequestDTO request
    ) {
        log.info("User {} creating seller request", userId);
        SellerRequestResponse response = sellerRequestService.createSellerRequest(userId, request);
        return ResponseEntity.ok(new ApiResponse<>("Seller request created successfully", response));
    }

    /**
     * Get my seller request
     */
    @GetMapping("/my")
    public ResponseEntity<?> getMySellerRequest(
            @RequestHeader("X-User-Id") Long userId
    ) {
        log.info("User {} getting own seller request", userId);
        SellerRequestResponse response = sellerRequestService.getMySellerRequest(userId);
        return ResponseEntity.ok(new ApiResponse<>("Get seller request successfully", response));
    }

    /**
     * Cancel my pending seller request
     */
    @DeleteMapping("/my")
    public ResponseEntity<?> cancelSellerRequest(
            @RequestHeader("X-User-Id") Long userId
    ) {
        log.info("User {} cancelling seller request", userId);
        sellerRequestService.cancelSellerRequest(userId);
        return ResponseEntity.ok(new ApiResponse<>("Seller request cancelled successfully", null));
    }
}
