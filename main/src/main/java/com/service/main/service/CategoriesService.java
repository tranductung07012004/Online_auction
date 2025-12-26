package com.service.main.service;

import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import org.springframework.data.domain.Page;

import com.service.main.dto.categoriesResponse;

import java.util.List;

public interface CategoriesService {
    categoriesResponse createCategory(createCategoriesRequest request);

    categoriesResponse updateCategory(Integer id, updateCategoriesRequest request);

    void deleteCategory(Integer id);

    List<categoriesResponse> getAllCategories();

    Page<categoriesResponse> searchCategories(String name, int page, int size);

    Page<categoriesResponse> searchParentCategories(String name, int page, int size);

    Page<categoriesResponse> searchChildCategories(String name, int page, int size);

    Long countProductsByCategory(Integer categoryId);
}

