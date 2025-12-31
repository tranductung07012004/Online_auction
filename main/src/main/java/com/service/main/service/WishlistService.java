package com.service.main.service;

import com.service.main.dto.WishlistResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WishlistService {
    WishlistResponse createWishlist(Long userId, Long productId);
    Page<WishlistResponse> getWishlistsByUserId(Long userId, Pageable pageable);
    List<WishlistResponse> getAllWishlistsByUserId(Long userId);
    Page<WishlistResponse> getWishlistsByProductId(Long productId, Pageable pageable);
    void deleteWishlist(Long userId, Long productId);
}

