package com.service.admin.service.impl;

import com.service.admin.dto.CreateCategoriesRequest;
import com.service.admin.dto.UpdateCategoriesRequest;
import com.service.admin.entity.CategoriesInAdmin;
import com.service.common.exception.ApplicationException;
import com.service.admin.repository.CategoriesRepositoryInAdmin;
import com.service.admin.service.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;

import com.service.common.constants.ErrorCodes;
import com.service.common.constants.ErrorMessages;

import com.service.admin.dto.CategoriesResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {
    private final CategoriesRepositoryInAdmin categoriesRepository;

    @Override
    public CategoriesResponse createCategory(CreateCategoriesRequest request) {
        String name = request.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new ApplicationException(ErrorCodes.VALIDATION_FAILED, ErrorMessages.CATEGORY_NAME_IS_REQUIRED);
        }
        name = name.trim();

        CategoriesInAdmin existing = categoriesRepository.findByName(name);
        if (existing != null) {
            throw new ApplicationException(ErrorCodes.DUPLICATE_KEY, ErrorMessages.CATEGORY_NAME_EXISTS);
        }

        Integer parentId = request.getParent_id();
        if (parentId != null && !categoriesRepository.existsById(parentId)) {
            throw new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, ErrorMessages.PARENT_CATEGORY_NOT_FOUND);
        }

        CategoriesInAdmin category = CategoriesInAdmin.builder()
                .name(name)
                .parent_id(parentId)
                .build();

        CategoriesInAdmin saved = categoriesRepository.save(category);
        return new CategoriesResponse(saved);
    }

    @Override
    public CategoriesResponse updateCategory(Integer id, UpdateCategoriesRequest request) {
        CategoriesInAdmin category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.RESOURCE_NOT_FOUND, "Category not found"));

        CategoriesInAdmin updated = applyAndSaveUpdates(
                id,
                category,
                request.getName(),
                request.getParent_id()
        );

        return new CategoriesResponse(updated);
    }

    private CategoriesInAdmin applyAndSaveUpdates(Integer id, CategoriesInAdmin category, String name, Integer parentId) {
        boolean hasNameUpdate = name != null && !name.trim().isEmpty();
        if (hasNameUpdate) {
            name = name.trim();

            CategoriesInAdmin existing = categoriesRepository.findByName(name);
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
    public Page<CategoriesResponse> searchCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        Page<CategoriesInAdmin> categories = categoriesRepository.findByNameContainingIgnoreCase(
                name.trim(),
            PageRequest.of(page, size)
        );

        return categories.map(CategoriesResponse::new);
    }

    @Override 
    public Page<CategoriesResponse> searchParentCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        name = name.trim();
        Page<CategoriesInAdmin> categories = categoriesRepository.searchParentCategories(
            name,
            PageRequest.of(page, size)
        );
        return categories.map(CategoriesResponse::new);
    }

    @Override 
    public Page<CategoriesResponse> searchChildCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        name = name.trim();

        Page<CategoriesInAdmin> categories = categoriesRepository.searchChildCategories(
            name, 
            PageRequest.of(page, size)
        );
        return categories.map(CategoriesResponse::new);
    }

    @Override
    public void deleteCategory(Integer id) {
        CategoriesInAdmin category = categoriesRepository.findById(id)
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
    public List<CategoriesResponse> getAllCategories() {
        return categoriesRepository.findAll()
                .stream()
                .map(CategoriesResponse::new)
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

