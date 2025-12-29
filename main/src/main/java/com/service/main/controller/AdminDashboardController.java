package com.service.main.controller;

import com.service.main.dto.AdminDashboardStats;
import com.service.main.dto.ApiResponse;
import com.service.main.dto.RecentProductDTO;
import com.service.main.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/main/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Get dashboard statistics (products, auctions, categories)
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        log.info("Admin request: Get dashboard statistics");
        AdminDashboardStats stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(new ApiResponse<>("Get dashboard statistics successfully", stats));
    }

    /**
     * Get recent products
     */
    @GetMapping("/recent-products")
    public ResponseEntity<?> getRecentProducts(
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Admin request: Get {} recent products", limit);
        List<RecentProductDTO> recentProducts = adminDashboardService.getRecentProducts(limit);
        return ResponseEntity.ok(new ApiResponse<>("Get recent products successfully", recentProducts));
    }
}
