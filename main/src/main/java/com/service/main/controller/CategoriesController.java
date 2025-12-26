package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import com.service.main.service.CategoriesService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.service.main.dto.categoriesResponse;

@RestController
@RequestMapping("/api/main/categories")
@RequiredArgsConstructor
public class CategoriesController {

    private final CategoriesService categoriesService;

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get all categories successfully", categoriesService.getAllCategories()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody createCategoriesRequest req) {
        categoriesResponse category = categoriesService.createCategory(req);
        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("Category created successfully", category));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable("id") Integer id,
            @Valid @RequestBody updateCategoriesRequest req
    ) {
        categoriesResponse category = categoriesService.updateCategory(id, req);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Category updated successfully", category));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") Integer id) {
        categoriesService.deleteCategory(id);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Category deleted successfully", null));
    }

    @GetMapping("/search-norm")
    public ResponseEntity<?> searchCategoriesNorm(
            @RequestParam(value = "name", required = false, defaultValue = "") String name,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        Page<categoriesResponse> categories = categoriesService.searchCategories(name, page, size);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Search categories successfully", categories));
    }

    @GetMapping("/search-norm-parent")
    public ResponseEntity<?> searchParentCategoriesNorm(
            @RequestParam(value = "name", required = false, defaultValue = "") String name,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        Page<categoriesResponse> categories = categoriesService.searchParentCategories(name, page, size);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Search parent categories successfully", categories));
    }

    @GetMapping("/search-norm-child")
    public ResponseEntity<?> searchChildCategoriesNorm(
            @RequestParam(value = "name", required = false, defaultValue = "") String name,
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        Page<categoriesResponse> categories = categoriesService.searchChildCategories(name, page, size);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Search child categories successfully", categories));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/product-count/{id}")
    public ResponseEntity<?> getProductCountByCategory(@PathVariable("id") Integer categoryId) {
        Long count = categoriesService.countProductsByCategory(categoryId);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get product count successfully", count));
    }
}

