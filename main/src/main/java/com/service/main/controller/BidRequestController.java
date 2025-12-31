package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.BidRequestResponse;
import com.service.main.dto.VerifyBidRequestRequest;
import com.service.main.service.BidRequestService;
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
@RequestMapping("/api/main/bid-request")
@RequiredArgsConstructor
public class BidRequestController {

    private final BidRequestService bidRequestService;

    @PostMapping("/verify")
    public ResponseEntity<?> verifyBidRequest(
            @Valid @RequestBody VerifyBidRequestRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        BidRequestResponse result = bidRequestService.verifyBidRequest(
                request.getBidderId(),
                request.getProductId(),
                currentUserId
        );

        return ResponseEntity.ok(new ApiResponse<>("Bid request verified successfully", result));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<BidRequestResponse>>> getBidRequestsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(defaultValue = "endAt,asc", required = false) String sort
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<BidRequestResponse> result = bidRequestService.getBidRequestsByProductId(productId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Bid requests retrieved successfully", result));
    }
}

