package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.AutoBidResponse;
import com.service.main.dto.CreateAutoBidRequest;
import com.service.main.service.AutoBidService;
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
@RequestMapping("/api/main/auto-bid")
@RequiredArgsConstructor
public class AutoBidController {

    private final AutoBidService autoBidService;

    @PostMapping
    public ResponseEntity<?> createAutoBid(
            @Valid @RequestBody CreateAutoBidRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Long currentUserId = Long.valueOf(authentication.getName());

        AutoBidResponse res = autoBidService.createAutoBid(request, currentUserId);

        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("Auto bid created successfully", res));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<AutoBidResponse>>> getAutoBidsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(defaultValue = "endAt,asc", required = false) String sort
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<AutoBidResponse> result = autoBidService.getAutoBidsByProductId(productId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Auto bids retrieved successfully", result));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> checkUserCanBid(
            @PathVariable Long productId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        boolean canBid = autoBidService.canUserBid(currentUserId, productId);

        return ResponseEntity.ok(new ApiResponse<>("User can bid on this product", canBid));
    }
}
