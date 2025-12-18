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

@Service
@RequiredArgsConstructor
public class CategoriesServiceImpl implements CategoriesService {
    private final CategoriesRepository categoriesRepository;

    @Override
    public Categories createCategory(createCategoriesRequest request) {
        String name = request.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new ApplicationException("Category name is required!");
        }
        name = name.trim();

        Categories existing = categoriesRepository.findByName(name);
        if (existing != null) {
            throw new ApplicationException("Category name already exists");
        }

        Integer parentId = request.getParent_id();
        if (parentId != null && !categoriesRepository.existsById(parentId)) {
            throw new ApplicationException("Parent category not found");
        }

        Categories category = Categories.builder()
                .name(name)
                .parent_id(parentId)
                .build();

        return categoriesRepository.save(category);
    }

    @Override
    public Categories updateCategory(Integer id, updateCategoriesRequest request) {
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ApplicationException("Category not found"));

        return applyAndSaveUpdates(id, category, request.getName(), request.getParent_id());
    }

    private Categories applyAndSaveUpdates(Integer id, Categories category, String name, Integer parentId) {
        boolean hasNameUpdate = name != null && !name.trim().isEmpty();
        if (hasNameUpdate) {
            name = name.trim();
            
            Categories existing = categoriesRepository.findByName(name);
            if (existing != null && !existing.getId().equals(id)) {
                throw new ApplicationException("Category name already exists");
            }
            category.setName(name);
        }

        if (parentId != null) {
            if (parentId.equals(id)) {
                throw new ApplicationException("Parent category cannot be itself");
            }
            if (!categoriesRepository.existsById(parentId)) {
                throw new ApplicationException("Parent category not found");
            }
            category.setParent_id(parentId);
        }

        if (!hasNameUpdate && parentId == null) {
            throw new ApplicationException("No fields to update");
        }

        return categoriesRepository.save(category);
    }

    @Override
    public Page<Categories> searchCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        return categoriesRepository.findByNameContainingIgnoreCase(
                name.trim(),
            PageRequest.of(page, size)
        );
    }

    @Override 
    public Page<Categories> searchParentCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        name = name.trim();
        return categoriesRepository.searchParentCategories(
            name,
            PageRequest.of(page, size)
        );
    }

    @Override 
    public Page<Categories> searchChildCategories(String name, int page, int size) {
        if (name == null) {
            name = "";
        }
        name = name.trim();

        return categoriesRepository.searchChildCategories(
            name, 
            PageRequest.of(page, size)
        );
    }
}

