package com.service.user.controller;

import com.service.user.dto.*;
import com.service.user.repository.SellerRequestRepository;
import com.service.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.service.user.constants.SellerRequestStatus;

@RestController
@RequestMapping("/api/user/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final SellerRequestRepository sellerRequestRepository;

    /**
     * Get all users with pagination
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Get all users - page: {}, size: {}", page, size);
        PageResponse<UserListResponse> users = adminUserService.getAllUsers(page, size);
        return ResponseEntity.ok(new ApiResponse<>("Get all users successfully", users));
    }

    /**
     * Get users by role with pagination
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Get users by role: {} - page: {}, size: {}", role, page, size);
        PageResponse<UserListResponse> users = adminUserService.getUsersByRole(role.toUpperCase(), page, size);
        return ResponseEntity.ok(new ApiResponse<>("Get users by role successfully", users));
    }

    /**
     * Search users by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Admin request: Search users with keyword: {} - page: {}, size: {}", keyword, page, size);
        PageResponse<UserListResponse> users = adminUserService.searchUsers(keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>("Search users successfully", users));
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        log.info("Admin request: Get user by id: {}", userId);
        UserListResponse user = adminUserService.getUserById(userId);
        return ResponseEntity.ok(new ApiResponse<>("Get user successfully", user));
    }

    /**
     * Update user role
     */
    @PutMapping("/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        log.info("Admin request: Update role for user {} to {}", userId, request.getRole());
        UserListResponse user = adminUserService.updateUserRole(userId, request);
        return ResponseEntity.ok(new ApiResponse<>("User role updated successfully", user));
    }

    /**
     * Update user verification status
     */
    @PutMapping("/{userId}/verification")
    public ResponseEntity<?> updateUserVerification(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserVerificationRequest request
    ) {
        log.info("Admin request: Update verification for user {} to {}", userId, request.getVerified());
        UserListResponse user = adminUserService.updateUserVerification(userId, request);
        return ResponseEntity.ok(new ApiResponse<>("User verification updated successfully", user));
    }

    /**
     * Update user details (fullname, avatar, address)
     */
    @PutMapping("/{userId}/details")
    public ResponseEntity<?> updateUserDetails(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserDetailsRequest request
    ) {
        log.info("Admin request: Update details for user {}", userId);
        UserListResponse user = adminUserService.updateUserDetails(userId, request);
        return ResponseEntity.ok(new ApiResponse<>("User details updated successfully", user));
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        log.info("Admin request: Delete user with id: {}", userId);
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponse<>("User deleted successfully", null));
    }

    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics() {
        log.info("Admin request: Get user statistics");
        long totalUsers = adminUserService.getTotalUserCount();
        long adminCount = adminUserService.getUserCountByRole("ADMIN");
        long sellerCount = adminUserService.getUserCountByRole("SELLER");
        long bidderCount = adminUserService.getUserCountByRole("BIDDER");
        long userCount = adminUserService.getUserCountByRole("USER");
        long pendingSellerRequests = sellerRequestRepository.countByStatus(SellerRequestStatus.PENDING);
        
        UserStatisticsResponse stats = UserStatisticsResponse.builder()
                .totalUsers(totalUsers)
                .adminCount(adminCount)
                .sellerCount(sellerCount)
                .bidderCount(bidderCount)
                .userCount(userCount)
                .pendingSellerRequests(pendingSellerRequests)
                .build();
        
        return ResponseEntity.ok(new ApiResponse<>("Get user statistics successfully", stats));
    }
}
