package com.service.user.controller;

import com.service.user.dto.AdminDashboardUserStats;
import com.service.user.dto.ApiResponse;
import com.service.user.dto.RecentUserDTO;
import com.service.user.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Get user statistics for admin dashboard
     */
    @GetMapping("/user-stats")
    public ResponseEntity<?> getUserStatistics() {
        log.info("Admin request: Get user statistics for dashboard");
        AdminDashboardUserStats stats = adminDashboardService.getUserStatistics();
        return ResponseEntity.ok(new ApiResponse<>("Get user statistics successfully", stats));
    }

    /**
     * Get recent registered users
     */
    @GetMapping("/recent-users")
    public ResponseEntity<?> getRecentUsers(
            @RequestParam(defaultValue = "10") int limit
    ) {
        log.info("Admin request: Get {} recent users", limit);
        List<RecentUserDTO> recentUsers = adminDashboardService.getRecentUsers(limit);
        return ResponseEntity.ok(new ApiResponse<>("Get recent users successfully", recentUsers));
    }
}
