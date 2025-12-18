package com.service.main.service;

import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import com.service.main.entity.Categories;
import org.springframework.data.domain.Page;
public interface CategoriesService {
    Categories createCategory(createCategoriesRequest request);

    Categories updateCategory(Integer id, updateCategoriesRequest request);

    Page<Categories> searchCategories(String name, int page, int size);

    Page<Categories> searchParentCategories(String name, int page, int size);

    Page<Categories> searchChildCategories(String name, int page, int size);
}

