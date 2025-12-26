package com.service.main.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.service.main.service.ProductService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}
