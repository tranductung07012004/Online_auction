package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.WishlistResponse;
import com.service.main.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/main/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{productId}")
    public ResponseEntity<?> createWishlist(
            @PathVariable Long productId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        WishlistResponse result = wishlistService.createWishlist(currentUserId, productId);

        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("Product added to wishlist successfully", result));
    }

    @GetMapping("/user")
    public ResponseEntity<?> getWishlistsByUserId(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<WishlistResponse> result = wishlistService.getWishlistsByUserId(currentUserId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Wishlist retrieved successfully", result));
    }

    @GetMapping("/user/all")
    public ResponseEntity<?> getAllWishlistsByUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        List<WishlistResponse> result = wishlistService.getAllWishlistsByUserId(currentUserId);

        return ResponseEntity.ok(new ApiResponse<>("All wishlist retrieved successfully", result));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getWishlistsByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WishlistResponse> result = wishlistService.getWishlistsByProductId(productId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Wishlist retrieved successfully", result));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteWishlist(
            @PathVariable Long productId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());

        wishlistService.deleteWishlist(currentUserId, productId);

        return ResponseEntity.ok(new ApiResponse<>("Product removed from wishlist successfully", null));
    }
}

