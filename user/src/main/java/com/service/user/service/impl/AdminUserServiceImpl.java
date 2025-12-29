package com.service.user.service.impl;

import com.service.user.constants.ErrorCodes;
import com.service.user.dto.PageResponse;
import com.service.user.dto.UpdateUserDetailsRequest;
import com.service.user.dto.UpdateUserRoleRequest;
import com.service.user.dto.UpdateUserVerificationRequest;
import com.service.user.dto.UserListResponse;
import com.service.user.entity.User;
import com.service.user.entity.UserDetails;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepo;
    private final UserDetailsRepository userDetailsRepo;

    @Override
    public PageResponse<UserListResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> userPage = userRepo.findAll(pageable);
        
        return buildPageResponse(userPage);
    }

    @Override
    public PageResponse<UserListResponse> getUsersByRole(String role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> userPage = userRepo.findByRole(role, pageable);
        
        return buildPageResponse(userPage);
    }

    @Override
    public PageResponse<UserListResponse> searchUsers(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        
        // Search in user details (fullname, address) first
        List<Long> userIdsFromDetails = userDetailsRepo.searchUserIdsByKeyword(keyword);
        
        Page<User> userPage;
        if (!userIdsFromDetails.isEmpty()) {
            // Search with user IDs from details + email/role search
            userPage = userRepo.searchUsersWithIds(userIdsFromDetails, keyword, pageable);
        } else {
            // Only search by email/role
            userPage = userRepo.searchUsers(keyword, pageable);
        }
        
        return buildPageResponse(userPage);
    }

    @Override
    public UserListResponse getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        return mapToUserListResponse(user);
    }

    @Override
    @Transactional
    public UserListResponse updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        // Validate role
        String newRole = request.getRole().toUpperCase();
        if (!isValidRole(newRole)) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_ROLE,
                    "Invalid role: " + request.getRole()
            );
        }
        
        user.setRole(newRole);
        User savedUser = userRepo.save(user);
        
        log.info("Updated role for user {} to {}", userId, newRole);
        
        return mapToUserListResponse(savedUser);
    }

    @Override
    @Transactional
    public UserListResponse updateUserVerification(Long userId, UpdateUserVerificationRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        UserDetails userDetails = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_DETAILS_NOT_FOUND,
                        "User details not found for user id: " + userId
                ));
        
        userDetails.setVerified(request.getVerified());
        userDetailsRepo.save(userDetails);
        
        log.info("Updated verification status for user {} to {}", userId, request.getVerified());
        
        return mapToUserListResponse(user);
    }

    @Override
    @Transactional
    public UserListResponse updateUserDetails(Long userId, UpdateUserDetailsRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        UserDetails userDetails = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_DETAILS_NOT_FOUND,
                        "User details not found for user id: " + userId
                ));
        
        // Update only non-null fields
        if (request.getFullname() != null) {
            userDetails.setFullname(request.getFullname());
        }
        if (request.getAvatar() != null) {
            userDetails.setAvatar(request.getAvatar());
        }
        if (request.getAddress() != null) {
            userDetails.setAddress(request.getAddress());
        }
        
        userDetailsRepo.save(userDetails);
        
        log.info("Updated details for user {}", userId);
        
        return mapToUserListResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ApplicationException(
                        ErrorCodes.USER_NOT_FOUND,
                        "User not found with id: " + userId
                ));
        
        // Check if user is admin - prevent deleting admin users
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ApplicationException(
                    ErrorCodes.CANNOT_DELETE_ADMIN,
                    "Cannot delete admin user"
            );
        }
        
        // Delete user details first
        userDetailsRepo.findByUserId(userId).ifPresent(userDetailsRepo::delete);
        
        // Delete user
        userRepo.delete(user);
        
        log.info("Deleted user with id: {}", userId);
    }

    @Override
    public long getTotalUserCount() {
        return userRepo.count();
    }

    @Override
    public long getUserCountByRole(String role) {
        return userRepo.countByRole(role);
    }

    /**
     * Build page response from user page
     */
    private PageResponse<UserListResponse> buildPageResponse(Page<User> userPage) {
        List<UserListResponse> content = userPage.getContent().stream()
                .map(this::mapToUserListResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<UserListResponse>builder()
                .content(content)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .size(userPage.getSize())
                .number(userPage.getNumber())
                .build();
    }

    /**
     * Map User entity to UserListResponse DTO
     */
    private UserListResponse mapToUserListResponse(User user) {
        Optional<UserDetails> detailsOpt = userDetailsRepo.findByUserId(user.getId());
        
        UserListResponse.UserListResponseBuilder builder = UserListResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole());
        
        if (detailsOpt.isPresent()) {
            UserDetails details = detailsOpt.get();
            builder.fullname(details.getFullname())
                    .avatar(details.getAvatar())
                    .address(details.getAddress())
                    .verified(details.getVerified())
                    .likeCount(details.getLike_count())
                    .dislikeCount(details.getDislike_count())
                    .createdAt(details.getCreated_at());
        }
        
        return builder.build();
    }

    /**
     * Validate if role is valid
     */
    private boolean isValidRole(String role) {
        return "USER".equals(role) || 
               "ADMIN".equals(role) || 
               "SELLER".equals(role) ||
               "BIDDER".equals(role);
    }
}
