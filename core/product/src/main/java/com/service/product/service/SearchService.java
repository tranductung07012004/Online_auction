package com.service.product.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.service.product.dto.product.response.ProductResponse;

import java.util.List;

public interface SearchService {
    Page<ProductResponse> search(String keyword, List<Integer> categoryIds, Pageable pageable, Sort sort);
}
