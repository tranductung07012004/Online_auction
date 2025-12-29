package com.service.main.service.impl;

import com.service.main.constants.ErrorCodes;
import com.service.main.dto.*;
import com.service.main.entity.Product;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.ProductRepository;
import com.service.main.service.AdminProductService;
import com.service.main.service.ProductService;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProductServiceImpl implements AdminProductService {

    private final ProductRepository productRepo;
    private final ProductService productService;
    private final UserServiceClient userServiceClient;

    @Override
    public PageResponse<AdminProductListResponse> getAllProducts(
            int page,
            int size,
            String search,
            String status,
            Long sellerId,
            Integer categoryId,
            String sortBy,
            String sortDir
    ) {
        // Build sort
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "desc"), 
                           sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        OffsetDateTime now = OffsetDateTime.now();
        Page<Product> productPage;

        // Apply status filter
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        if ("ACTIVE".equalsIgnoreCase(status)) {
            productPage = productRepo.findActiveWithFilters(now, searchParam, sellerId, pageable);
        } else if ("ENDED".equalsIgnoreCase(status)) {
            productPage = productRepo.findEndedWithFilters(now, searchParam, sellerId, pageable);
        } else {
            productPage = productRepo.findAllWithFilters(searchParam, sellerId, pageable);
        }

        // Get seller info for all products
        List<AdminProductListResponse> content = mapToAdminProductList(productPage.getContent(), now);

        return PageResponse.<AdminProductListResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .build();
    }

    @Override
    public ProductResponse getProductById(Long productId) {
        return productService.getProductById(productId);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));
        
        log.info("Admin deleting product: {} (ID: {})", product.getProductName(), productId);
        productRepo.delete(product);
    }

    @Override
    @Transactional
    public void endAuctionEarly(Long productId, String reason) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Product not found"));
        
        OffsetDateTime now = OffsetDateTime.now();
        
        if (product.getEndAt().isBefore(now)) {
            throw new ApplicationException(ErrorCodes.INVALID_ACTION, "Auction has already ended");
        }
        
        log.info("Admin ending auction early for product: {} (ID: {}). Reason: {}", 
                product.getProductName(), productId, reason);
        
        // Set end time to now to end the auction
        product.setEndAt(now);
        productRepo.save(product);
    }

    @Override
    public AdminProductStats getProductStats() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime endingSoon = now.plusHours(24);

        long totalProducts = productRepo.count();
        long activeProducts = productRepo.countActiveAuctions(now);
        long endedProducts = productRepo.countEndedAuctions(now);
        long productsWithBids = productRepo.countProductsWithBids();
        long productsWithoutBids = productRepo.countProductsWithoutBids();
        long endingSoonProducts = productRepo.countEndingSoonAuctions(now, endingSoon);

        return AdminProductStats.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .endedProducts(endedProducts)
                .cancelledProducts(0L) // No cancel status in current schema
                .productsWithBids(productsWithBids)
                .productsWithoutBids(productsWithoutBids)
                .productsEndingSoon(endingSoonProducts)
                .build();
    }

    @Override
    public PageResponse<AdminProductListResponse> getProductsBySeller(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage = productRepo.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);
        
        OffsetDateTime now = OffsetDateTime.now();
        List<AdminProductListResponse> content = mapToAdminProductList(productPage.getContent(), now);

        return PageResponse.<AdminProductListResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .build();
    }

    /**
     * Map products to admin list response with user info
     */
    private List<AdminProductListResponse> mapToAdminProductList(List<Product> products, OffsetDateTime now) {
        // Collect all user IDs (sellers and top bidders)
        Set<Long> userIds = products.stream()
                .flatMap(p -> {
                    if (p.getTopBidderId() != null) {
                        return java.util.stream.Stream.of(p.getSellerId(), p.getTopBidderId());
                    }
                    return java.util.stream.Stream.of(p.getSellerId());
                })
                .collect(Collectors.toSet());

        // Fetch user info in batch
        Map<Long, UserInfo> userInfoMap = fetchUserInfoBatch(userIds);

        return products.stream()
                .map(product -> mapProductToAdminResponse(product, userInfoMap, now))
                .collect(Collectors.toList());
    }

    private AdminProductListResponse mapProductToAdminResponse(Product product, Map<Long, UserInfo> userInfoMap, OffsetDateTime now) {
        UserInfo seller = userInfoMap.get(product.getSellerId());
        UserInfo topBidder = product.getTopBidderId() != null 
                ? userInfoMap.get(product.getTopBidderId()) 
                : null;

        // Get first category name
        String categoryName = null;
        if (product.getProductCategories() != null && !product.getProductCategories().isEmpty()) {
            categoryName = product.getProductCategories().get(0).getCategory().getName();
        }

        // Determine status
        String status = product.getEndAt().isAfter(now) ? "ACTIVE" : "ENDED";

        return AdminProductListResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .thumbnailUrl(product.getThumbnailUrl())
                .startPrice(product.getStartPrice())
                .currentPrice(product.getCurrentPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .bidCount(product.getBidCount())
                .sellerId(product.getSellerId())
                .sellerName(seller != null ? seller.getFullname() : null)
                .sellerEmail(seller != null ? seller.getEmail() : null)
                .topBidderId(product.getTopBidderId())
                .topBidderName(topBidder != null ? topBidder.getFullname() : null)
                .categoryName(categoryName)
                .createdAt(product.getCreatedAt())
                .endAt(product.getEndAt())
                .status(status)
                .build();
    }

    /**
     * Fetch user info in batch from user service
     */
    private Map<Long, UserInfo> fetchUserInfoBatch(Set<Long> userIds) {
        try {
            // Call user service to get user info
            Map<Long, UserInfo> result = new java.util.HashMap<>();
            for (Long id : userIds) {
                try {
                    UserInfo userInfo = userServiceClient.getUserInfoById(id);
                    if (userInfo != null) {
                        result.put(id, userInfo);
                    } else {
                        result.put(id, createUnknownUser(id));
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch user info for ID: {}", id);
                    result.put(id, createUnknownUser(id));
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to fetch user info batch", e);
            Map<Long, UserInfo> fallbackResult = new java.util.HashMap<>();
            for (Long id : userIds) {
                fallbackResult.put(id, createUnknownUser(id));
            }
            return fallbackResult;
        }
    }

    private UserInfo createUnknownUser(Long id) {
        return UserInfo.builder()
                .id(id)
                .fullname("Unknown User")
                .email("unknown@email.com")
                .build();
    }
}
