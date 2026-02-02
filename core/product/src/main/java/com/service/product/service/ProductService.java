package com.service.product.service;

import com.service.product.dto.product.request.AddProductDescriptionRequest;
import com.service.product.dto.product.response.ProductResponse;
import com.service.product.dto.product.request.createProductRequest;
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
    Page<ProductResponse> getActiveProductBasedOnBidderWhoIsBidding(Long bidderId, Pageable pageable);
    void addProductDescription(Long productId, AddProductDescriptionRequest request, Long userId);
}


