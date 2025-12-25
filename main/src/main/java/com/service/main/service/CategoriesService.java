package com.service.main.service;

import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import org.springframework.data.domain.Page;

import com.service.main.dto.categoriesResponse;

public interface CategoriesService {
    categoriesResponse createCategory(createCategoriesRequest request);

    categoriesResponse updateCategory(Integer id, updateCategoriesRequest request);

    Page<categoriesResponse> searchCategories(String name, int page, int size);

    Page<categoriesResponse> searchParentCategories(String name, int page, int size);

    Page<categoriesResponse> searchChildCategories(String name, int page, int size);
}

