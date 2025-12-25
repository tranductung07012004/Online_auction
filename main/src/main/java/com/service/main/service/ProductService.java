package com.service.main.service;

import com.service.main.dto.ProductResponse;
import com.service.main.dto.createProductRequest;

import java.util.List;

public interface ProductService {
    void createProduct(createProductRequest request);
    ProductResponse getProductById(Long productId);
    List<ProductResponse> getTop5EndingSoon();
    List<ProductResponse> getTop5MostBidded();
    List<ProductResponse> getTop5HighestCurrentPrice();
}


