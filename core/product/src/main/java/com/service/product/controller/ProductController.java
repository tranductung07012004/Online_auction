package com.service.product.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.service.product.service.ProductService;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import com.service.product.dto.product.request.AddProductDescriptionRequest;
import com.service.product.dto.product.request.createProductRequest;
import com.service.product.dto.product.response.ProductResponse;
import com.service.common.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/main/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final Logger log = LoggerFactory.getLogger(ProductController.class);


    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public ResponseEntity<?> createProduct(
        @Valid @RequestBody createProductRequest request
    ) {
        for (int i = 1; i <= 1000; i++) {
            log.info("Hello World {}", i);
        }

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

    @GetMapping("/bidder/active")
    public ResponseEntity<?> getActiveProductsByBidder(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "2") int size
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long bidderId = Long.valueOf(authentication.getName());

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> res = this.productService.getActiveProductBasedOnBidderWhoIsBidding(bidderId, pageable);

        return ResponseEntity
        .status(200)
        .body(new ApiResponse<>("Active products based on bidder's bids retrieved successfully", res));
    }

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping("/{productId}/description")
    public ResponseEntity<?> addProductDescription(
            @PathVariable Long productId,
            @Valid @RequestBody AddProductDescriptionRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        this.productService.addProductDescription(productId, request, userId);
        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("Product description added successfully", null));
    }
}
