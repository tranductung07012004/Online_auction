package com.service.main.service;

import com.service.main.dto.ProductResponse;
import com.service.main.dto.createProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    void createProduct(createProductRequest request);
    ProductResponse getProductById(Long productId);
    List<ProductResponse> getTop5EndingSoon();
    List<ProductResponse> getTop5MostBidded();
    List<ProductResponse> getTop5HighestCurrentPrice();
    Page<ProductResponse> getProductsByCategory(Integer categoryId, Pageable pageable);
    Page<ProductResponse> getActiveProductsBySellerId(Long sellerId, Pageable pageable);
    Page<ProductResponse> getEndedProductsBySellerId(Long sellerId, Pageable pageable);
    Page<ProductResponse> getProductsBySellerId(Long sellerId, Pageable pageable);
}


