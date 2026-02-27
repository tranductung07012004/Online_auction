package com.service.admin.service;

import com.service.admin.dto.AdminProductListResponse;
import com.service.admin.dto.AdminProductStats;
import com.service.admin.dto.PageResponse;
import com.service.admin.dto.ProductResponse;

public interface AdminProductService {
    
    /**
     * Get all products with pagination and optional filters
     */
    PageResponse<AdminProductListResponse> getAllProducts(
            int page, 
            int size, 
            String search, 
            String status,  // ACTIVE, ENDED, ALL
            Long sellerId,
            Integer categoryId,
            String sortBy,
            String sortDir
    );
    
    /**
     * Get product details by ID (reuse existing logic)
     */
    ProductResponse getProductById(Long productId);
    
    /**
     * Delete a product (hard delete)
     */
    void deleteProduct(Long productId);
    
    /**
     * End auction early (set end_at to now)
     */
    void endAuctionEarly(Long productId, String reason);
    
    /**
     * Get product statistics for admin
     */
    AdminProductStats getProductStats();
    
    /**
     * Get products by seller
     */
    PageResponse<AdminProductListResponse> getProductsBySeller(Long sellerId, int page, int size);
}
