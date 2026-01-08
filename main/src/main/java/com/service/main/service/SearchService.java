package com.service.main.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.service.main.dto.ProductResponse;

import java.util.List;

public interface SearchService {
    Page<ProductResponse> search(String keyword, List<Integer> categoryIds, Pageable pageable, Sort sort);
}
