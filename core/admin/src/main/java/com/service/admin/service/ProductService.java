package com.service.admin.service;

import com.service.admin.dto.ProductResponse;

public interface ProductService {
    ProductResponse getProductById(Long productId);
}


