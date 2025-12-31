package com.service.user.controller;

import com.service.user.dto.*;
import com.service.user.service.SellerRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.service.user.constants.SellerRequestStatus;

@RestController
@RequestMapping("/api/user/admin/seller-requests")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminSellerRequestController {

    private final SellerRequestService sellerRequestService;

    /**
     * Get all seller requests with pagination
     */
    @GetMapping
    public ResponseEntity<?> getAllSellerRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Get all seller requests - page: {}, size: {}", page, size);
        PageResponse<SellerRequestResponse> requests = sellerRequestService.getAllSellerRequests(page, size);
        return ResponseEntity.ok(new ApiResponse<>("Get all seller requests successfully", requests));
    }

    /**
     * Get seller requests by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getSellerRequestsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Get seller requests by status: {} - page: {}, size: {}", status, page, size);
        SellerRequestStatus requestStatus = SellerRequestStatus.valueOf(status.toUpperCase());
        PageResponse<SellerRequestResponse> requests = sellerRequestService.getSellerRequestsByStatus(requestStatus, page, size);
        return ResponseEntity.ok(new ApiResponse<>("Get seller requests by status successfully", requests));
    }

    /**
     * Search seller requests by user email
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchSellerRequests(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Search seller requests with keyword: {} - page: {}, size: {}", keyword, page, size);
        PageResponse<SellerRequestResponse> requests = sellerRequestService.searchSellerRequests(keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>("Search seller requests successfully", requests));
    }

    /**
     * Get seller request by ID
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<?> getSellerRequestById(@PathVariable Long requestId) {
        log.info("Admin request: Get seller request by id: {}", requestId);
        SellerRequestResponse request = sellerRequestService.getSellerRequestById(requestId);
        return ResponseEntity.ok(new ApiResponse<>("Get seller request successfully", request));
    }

    /**
     * Review (approve/reject) seller request
     */
    @PutMapping("/{requestId}/review")
    public ResponseEntity<?> reviewSellerRequest(
            @PathVariable Long requestId,
            @RequestHeader("X-User-Id") Long adminId,
            @Valid @RequestBody ReviewSellerRequestDTO request
    ) {
        log.info("Admin {} reviewing seller request {} - approved: {}", adminId, requestId, request.getApproved());
        SellerRequestResponse response = sellerRequestService.reviewSellerRequest(requestId, adminId, request);
        String message = request.getApproved() ? "Seller request approved successfully" : "Seller request rejected successfully";
        return ResponseEntity.ok(new ApiResponse<>(message, response));
    }

    /**
     * Get seller request statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getSellerRequestStatistics() {
        log.info("Admin request: Get seller request statistics");
        SellerRequestStatistics stats = sellerRequestService.getSellerRequestStatistics();
        return ResponseEntity.ok(new ApiResponse<>("Get seller request statistics successfully", stats));
    }
}
