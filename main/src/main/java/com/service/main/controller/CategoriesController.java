package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.entity.Categories;
import com.service.main.service.CategoriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main/categories")
@RequiredArgsConstructor
public class CategoriesController {

    private final CategoriesService categoriesService;

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

