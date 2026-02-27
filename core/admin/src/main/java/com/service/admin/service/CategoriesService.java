package com.service.admin.service;

import com.service.admin.dto.CreateCategoriesRequest;
import com.service.admin.dto.UpdateCategoriesRequest;
import org.springframework.data.domain.Page;

import com.service.admin.dto.CategoriesResponse;

import java.util.List;

public interface CategoriesService {
    CategoriesResponse createCategory(CreateCategoriesRequest request);

    CategoriesResponse updateCategory(Integer id, UpdateCategoriesRequest request);

    void deleteCategory(Integer id);

    List<CategoriesResponse> getAllCategories();

    Page<CategoriesResponse> searchCategories(String name, int page, int size);

    Page<CategoriesResponse> searchParentCategories(String name, int page, int size);

    Page<CategoriesResponse> searchChildCategories(String name, int page, int size);

    Long countProductsByCategory(Integer categoryId);
}

