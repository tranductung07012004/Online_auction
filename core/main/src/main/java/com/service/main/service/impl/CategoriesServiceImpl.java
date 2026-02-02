package com.service.main.service.impl;

import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import com.service.main.entity.Categories;
import com.service.main.exception.ApplicationException;
import com.service.main.repository.CategoriesRepository;
import com.service.main.service.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;

import com.service.main.constants.ErrorCodes;
import com.service.main.constants.ErrorMessages;

import com.service.main.dto.categoriesResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {
    private final CategoriesRepository categoriesRepository;

    @Override
    public categoriesResponse createCategory(createCategoriesRequest request) {
        String name = request.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new ApplicationException(ErrorCodes.VALIDATION_FAILED, ErrorMessages.CATEGORY_NAME_IS_REQUIRED);
        }
        name = name.trim();

        Categories existing = categoriesRepository.findByName(name);
        if (existing != null) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, ErrorMessages.CATEGORY_NAME_EXISTS);
        }

        Integer parentId = request.getParent_id();
        if (parentId != null && !categoriesRepository.existsById(parentId)) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, ErrorMessages.PARENT_CATEGORY_NOT_FOUND);
        }

        Categories category = Categories.builder()
                .name(name)
                .parent_id(parentId)
                .build();

        Categories saved = categoriesRepository.save(category);
        return new categoriesResponse(saved);
    }

    @Override
    public categoriesResponse updateCategory(Integer id, updateCategoriesRequest request) {
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Category not found"));

        Categories updated = applyAndSaveUpdates(
                id,
                category,
                request.getName(),
                request.getParent_id()
        );

        return new categoriesResponse(updated);
    }

    private Categories applyAndSaveUpdates(Integer id, Categories category, String name, Integer parentId) {
        boolean hasNameUpdate = name != null && !name.trim().isEmpty();
        if (hasNameUpdate) {
            name = name.trim();

            Categories existing = categoriesRepository.findByName(name);
            if (existing != null && !existing.getId().equals(id)) {
                throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, "Category name already exists");
            }
            category.setName(name);
        }

        if (parentId != null) {
            if (parentId.equals(id)) {
                throw new ApplicationException(ErrorCodes.INVALID_INPUT, "Parent category cannot be itself");
            }
            if (!categoriesRepository.existsById(parentId)) {
                throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Parent category not found");
            }
            category.setParent_id(parentId);
        }

        if (!hasNameUpdate && parentId == null) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, "No fields to update");
        }

        return categoriesRepository.save(category);
    }

    @Override
    public Page<categoriesResponse> searchCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        Page<Categories> categories = categoriesRepository.findByNameContainingIgnoreCase(
                name.trim(),
            PageRequest.of(page, size)
        );

        return categories.map(categoriesResponse::new);
    }

    @Override 
    public Page<categoriesResponse> searchParentCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        name = name.trim();
        Page<Categories> categories = categoriesRepository.searchParentCategories(
            name,
            PageRequest.of(page, size)
        );
        return categories.map(categoriesResponse::new);
    }

    @Override 
    public Page<categoriesResponse> searchChildCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        name = name.trim();

        Page<Categories> categories = categoriesRepository.searchChildCategories(
            name, 
            PageRequest.of(page, size)
        );
        return categories.map(categoriesResponse::new);
    }

    @Override
    public void deleteCategory(Integer id) {
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Category not found"));

        Long productCount = categoriesRepository.countProductsByCategoryId(id);
        if (productCount != null && productCount > 0) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, "Cannot delete category because it has associated products");
        }

        Long childCount = categoriesRepository.countChildCategoriesByParentId(id);
        if (childCount != null && childCount > 0) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, "Cannot delete category because it has child categories");
        }

        categoriesRepository.delete(category);
    }

    @Override
    public List<categoriesResponse> getAllCategories() {
        return categoriesRepository.findAll()
                .stream()
                .map(categoriesResponse::new)
                .toList();
    }

    @Override
    public Long countProductsByCategory(Integer categoryId) {
        if (!categoriesRepository.existsById(categoryId)) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Category not found");
        }
        Long count = categoriesRepository.countProductsByCategoryId(categoryId);
        return count != null ? count : 0;
    }
}

