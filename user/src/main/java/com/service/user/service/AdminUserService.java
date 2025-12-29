package com.service.user.service;

import com.service.user.dto.PageResponse;
import com.service.user.dto.UpdateUserDetailsRequest;
import com.service.user.dto.UpdateUserRoleRequest;
import com.service.user.dto.UpdateUserVerificationRequest;
import com.service.user.dto.UserListResponse;

public interface AdminUserService {
    
    /**
     * Get all users with pagination
     */
    PageResponse<UserListResponse> getAllUsers(int page, int size);
    
    /**
     * Get users by role with pagination
     */
    PageResponse<UserListResponse> getUsersByRole(String role, int page, int size);
    
    /**
     * Search users by keyword
     */
    PageResponse<UserListResponse> searchUsers(String keyword, int page, int size);
    
    /**
     * Get user by ID
     */
    UserListResponse getUserById(Long userId);
    
    /**
     * Update user role
     */
    UserListResponse updateUserRole(Long userId, UpdateUserRoleRequest request);
    
    /**
     * Update user verification status
     */
    UserListResponse updateUserVerification(Long userId, UpdateUserVerificationRequest request);
    
    /**
     * Update user details (fullname, avatar, address)
     */
    UserListResponse updateUserDetails(Long userId, UpdateUserDetailsRequest request);
    
    /**
     * Delete user
     */
    void deleteUser(Long userId);
    
    /**
     * Get total user count
     */
    long getTotalUserCount();
    
    /**
     * Get user count by role
     */
    long getUserCountByRole(String role);
}
