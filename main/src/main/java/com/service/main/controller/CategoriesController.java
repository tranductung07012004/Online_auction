package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import com.service.main.entity.Categories;
import com.service.main.service.CategoriesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/main/categories")
@RequiredArgsConstructor
public class CategoriesController {
    private final CategoriesService categoriesService;

    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody createCategoriesRequest req) {
        Categories category = categoriesService.createCategory(req);
        return ResponseEntity
                .status(201)
                .body(new ApiResponse<>("Category created successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable("id") Integer id,
            @Valid @RequestBody updateCategoriesRequest req
    ) {
        Categories category = categoriesService.updateCategory(id, req);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Category updated successfully", category));
    }

    @GetMapping("/search-norm")
    public ResponseEntity<?> searchCategoriesNorm(
        @RequestParam(value = "name", required = false, defaultValue = "") String name,
        @RequestParam(value = "page", required = false, defaultValue = "0") int page,
        @RequestParam(value = "size", required = false, defaultValue = "10") int size
    ) {
        Page<Categories> categories = categoriesService.searchCategories(name, page, size);
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
        Page<Categories> categories = categoriesService.searchParentCategories(name, page, size);
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
        Page<Categories> categories = categoriesService.searchChildCategories(name, page, size);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Search child categories successfully", categories));
    }
}

