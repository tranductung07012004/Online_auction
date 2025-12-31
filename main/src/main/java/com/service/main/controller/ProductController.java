package com.service.main.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.service.main.service.ProductService;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import com.service.main.dto.createProductRequest;
import com.service.main.dto.ProductResponse;
import com.service.main.dto.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/main/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public ResponseEntity<?> createProduct(
        @Valid @RequestBody createProductRequest request
    ) {
        this.productService.createProduct(request);
        return ResponseEntity
            .status(201)
            .body(new ApiResponse<>("Product created successfully", null));
    }

    @GetMapping("/top-ending-soon")
    public ResponseEntity<?> getTop5ProductEndingSoon() {
        List<ProductResponse> res = this.productService.getTop5EndingSoon();

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get top 5 product ending soon successfully", res));
    }

    @GetMapping("/most-bid-count")
    public ResponseEntity<?> getTop5MostBidCount() {
        List<ProductResponse> res = this.productService.getTop5MostBidded();

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get top 5 product with most bid count successfully", res));
    }

    @GetMapping("/highest-current-price")
    public ResponseEntity<?> getTop5HighestCurrentPrice() {
        List<ProductResponse> res = this.productService.getTop5HighestCurrentPrice();

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get top 5 product with highest price", res));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getProductById(@PathVariable Long productId) {
        ProductResponse product = this.productService.getProductById(productId);
        return ResponseEntity
            .status(200)
            .body(new ApiResponse<>("Product retrieved successfully", product));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByCategory(
            @PathVariable Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(defaultValue = "endAt,asc", required = false) String sort
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<ProductResponse> res = productService.getProductsByCategory(categoryId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Products retrieved successfully", res));
    }

    //@PreAuthorize("hasRole('SELLER')")
    @GetMapping("/seller/active")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getActiveProductsBySeller(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long sellerId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> res = productService.getActiveProductsBySellerId(sellerId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Active products retrieved successfully", res));
    }

    //@PreAuthorize("hasRole('SELLER')")
    @GetMapping("/seller/ended")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getEndedProductsBySeller(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long sellerId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> res = productService.getEndedProductsBySellerId(sellerId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Ended products retrieved successfully", res));
    }

    @GetMapping("/seller")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsBySeller(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long sellerId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> res = productService.getProductsBySellerId(sellerId, pageable);

        return ResponseEntity.ok(new ApiResponse<>("Products retrieved successfully", res));
    }
}
