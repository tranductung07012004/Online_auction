package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;
import com.service.main.dto.WishlistResponse;
import com.service.main.entity.Wishlist;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.ProductRepository;
import com.service.main.repository.WishlistRepository;
import com.service.main.service.UserServiceClient;
import com.service.main.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.service.main.service.impl.ProductServiceImpl.formatUserInfo;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public WishlistResponse createWishlist(Long userId, Long productId) {
        UserInfoResponse userInfo = this.userServiceClient.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "User not found");
        }

        this.productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        boolean alreadyExists = this.wishlistRepository.existsByUserIdAndProductId(userId, productId);
        if (alreadyExists) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, "Product is already in your wishlist");
        }

        OffsetDateTime now = OffsetDateTime.now();
        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .productId(productId)
                .createdAt(now)
                .build();

        Wishlist savedWishlist = this.wishlistRepository.save(wishlist);
        return this.mapToResponse(savedWishlist);
    }

    @Override
    public Page<WishlistResponse> getWishlistsByUserId(Long userId, Pageable pageable) {
        UserInfoResponse userInfo = this.userServiceClient.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "User not found");
        }

        Page<Wishlist> wishlistPage = this.wishlistRepository.findByUserId(userId, pageable);
        return wishlistPage.map(this::mapToResponse);
    }

    @Override
    public List<WishlistResponse> getAllWishlistsByUserId(Long userId) {
        UserInfoResponse userInfo = this.userServiceClient.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "User not found");
        }

        List<Wishlist> wishlists = this.wishlistRepository.findAllByUserId(userId);
        return wishlists.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<WishlistResponse> getWishlistsByProductId(Long productId, Pageable pageable) {
        this.productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        Page<Wishlist> wishlistPage = this.wishlistRepository.findByProductId(productId, pageable);
        return wishlistPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteWishlist(Long userId, Long productId) {
        UserInfoResponse userInfo = this.userServiceClient.getUserBasicInfo(userId);
        if (userInfo == null) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "User not found");
        }

        this.productRepository.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));

        Wishlist wishlist = this.wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, 
                        "Wishlist item not found"));
        this.wishlistRepository.delete(wishlist);
    }

    private WishlistResponse mapToResponse(Wishlist wishlist) {
        UserInfoResponse userInfoRes = userServiceClient.getUserBasicInfo(wishlist.getUserId());
        UserInfo user = formatUserInfo(userInfoRes);

        WishlistResponse response = new WishlistResponse();
        response.setId(wishlist.getId());
        response.setProductId(wishlist.getProductId());
        response.setUser(user);
        response.setCreatedAt(wishlist.getCreatedAt());
        return response;
    }
}

