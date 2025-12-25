package com.service.main.controller.admin;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.createCategoriesRequest;
import com.service.main.dto.updateCategoriesRequest;
import com.service.main.entity.Categories;
import com.service.main.service.CategoriesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main/admin/categories")
@RequiredArgsConstructor
public class AdminCategoriesController {

    private final CategoriesService categoriesService;

    // Only rely on gateway-forwarded header to determine admin
    private static boolean isAdminFromHeader(String roleHeader) {
        return roleHeader != null
                && ("ADMIN".equalsIgnoreCase(roleHeader) || "ROLE_ADMIN".equalsIgnoreCase(roleHeader));
    }

    private static ResponseEntity<ApiResponse<Object>> forbidden() {
        return ResponseEntity.status(403)
                .body(new ApiResponse<>("Forbidden: X-user-role=ADMIN required", null));
    }

    @PostMapping
    public ResponseEntity<?> createCategory(
            @RequestHeader(value = "X-user-role", required = false) String roleHeader,
            @Valid @RequestBody createCategoriesRequest req
    ) {
        if (!isAdminFromHeader(roleHeader)) return forbidden();
        Categories category = categoriesService.createCategory(req);
        return ResponseEntity.status(201).body(new ApiResponse<>("Category created successfully", category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
            @RequestHeader(value = "X-user-role", required = false) String roleHeader,
            @PathVariable("id") Integer id
    ) {
        if (!isAdminFromHeader(roleHeader)) return forbidden();
        Categories category = categoriesService.getCategoryById(id);
        return ResponseEntity.status(200).body(new ApiResponse<>("Category retrieved successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader(value = "X-user-role", required = false) String roleHeader,
            @PathVariable("id") Integer id,
            @Valid @RequestBody updateCategoriesRequest req
    ) {
        if (!isAdminFromHeader(roleHeader)) return forbidden();
        Categories category = categoriesService.updateCategory(id, req);
        return ResponseEntity.status(200).body(new ApiResponse<>("Category updated successfully", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader(value = "X-user-role", required = false) String roleHeader,
            @PathVariable("id") Integer id
    ) {
        if (!isAdminFromHeader(roleHeader)) return forbidden();
        categoriesService.deleteCategory(id);
        return ResponseEntity.status(200).body(new ApiResponse<>("Category deleted successfully", null));
    }
}
