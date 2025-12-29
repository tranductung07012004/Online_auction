package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.BlackListResponse;
import com.service.main.dto.CreateBlackListRequest;
import com.service.main.service.BlackListService;
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
@RequestMapping("/api/main/blacklist")
@RequiredArgsConstructor
public class BlackListController {

    private final BlackListService blackListService;

    @PostMapping
    public ResponseEntity<?> blockUser(
            @Valid @RequestBody CreateBlackListRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        BlackListResponse result = blackListService.blockUser(
                request.getBidderId(),
                request.getProductId(),
                currentUserId
        );

        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("User blocked successfully", result));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getBlackListsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(defaultValue = "endAt,asc", required = false) String sort
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<BlackListResponse> result = blackListService.getBlackListsByProductId(productId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Blacklists retrieved successfully", result));
    }
}

