package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.BidHistoryResponse;
import com.service.main.service.BidHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main/bid-history")
@RequiredArgsConstructor
public class BidHistoryController {

    private final BidHistoryService bidHistoryService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<BidHistoryResponse>>> getBidHistoriesByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<BidHistoryResponse> result = bidHistoryService.getBidHistoriesByProductId(productId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Bid histories retrieved successfully", result));
    }
}


