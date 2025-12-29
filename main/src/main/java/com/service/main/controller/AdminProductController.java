package com.service.main.controller;

import com.service.main.dto.*;
import com.service.main.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main/admin/products")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final AdminProductService adminProductService;

    /**
     * Get all products with pagination and filters
     */
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        log.info("Admin request: Get all products - page: {}, size: {}, search: {}, status: {}", 
                page, size, search, status);
        
        PageResponse<AdminProductListResponse> products = adminProductService.getAllProducts(
                page, size, search, status, sellerId, categoryId, sortBy, sortDir
        );
        
        return ResponseEntity.ok(new ApiResponse<>("Get products successfully", products));
    }

    /**
     * Get product details by ID
     */
    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        log.info("Admin request: Get product by ID: {}", productId);
        ProductResponse product = adminProductService.getProductById(productId);
        return ResponseEntity.ok(new ApiResponse<>("Get product successfully", product));
    }

    /**
     * Get products by seller
     */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getProductsBySeller(
            @PathVariable Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Get products by seller ID: {}", sellerId);
        PageResponse<AdminProductListResponse> products = adminProductService.getProductsBySeller(sellerId, page, size);
        return ResponseEntity.ok(new ApiResponse<>("Get seller products successfully", products));
    }

    /**
     * Get product statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getProductStats() {
        log.info("Admin request: Get product statistics");
        AdminProductStats stats = adminProductService.getProductStats();
        return ResponseEntity.ok(new ApiResponse<>("Get product statistics successfully", stats));
    }

    /**
     * Delete a product (hard delete)
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        log.info("Admin request: Delete product ID: {}", productId);
        adminProductService.deleteProduct(productId);
        return ResponseEntity.ok(new ApiResponse<>("Product deleted successfully", null));
    }

    /**
     * End auction early
     */
    @PostMapping("/{productId}/end-auction")
    public ResponseEntity<?> endAuctionEarly(
            @PathVariable Long productId,
            @Valid @RequestBody AdminCancelProductRequest request
    ) {
        log.info("Admin request: End auction early for product ID: {}. Reason: {}", productId, request.getReason());
        adminProductService.endAuctionEarly(productId, request.getReason());
        return ResponseEntity.ok(new ApiResponse<>("Auction ended successfully", null));
    }
}
