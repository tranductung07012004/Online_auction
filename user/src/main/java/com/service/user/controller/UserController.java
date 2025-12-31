package com.service.user.controller;

import com.service.user.dto.ApiResponse;
import com.service.user.dto.UpdateAddressRequest;
import com.service.user.dto.UpdateAvatarRequest;
import com.service.user.dto.UpdateEmailRequest;
import com.service.user.dto.UpdateFullnameRequest;
import com.service.user.dto.UpdatePasswordRequest;
import com.service.user.dto.UserInfoResponse;
import com.service.user.dto.UserListResponse;
import com.service.user.dto.UserProfileResponse;
import com.service.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/internal")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}/info")
    public ResponseEntity<?> getUserBasicInfo(
            @PathVariable Long userId
    ) {
        UserInfoResponse res = userService.getUserBasicInfo(userId);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get user basic info successfully", res));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        List<UserListResponse> users = userService.getAllUsers();
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get all users successfully", users));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        
        UserProfileResponse profile = userService.getUserProfile(currentUserId);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Get user profile successfully", profile));
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(
            @Valid @RequestBody UpdateAvatarRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        
        userService.updateAvatar(currentUserId, request);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Update avatar successfully", null));
    }

    @PutMapping("/fullname")
    public ResponseEntity<?> updateFullname(
            @Valid @RequestBody UpdateFullnameRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        
        userService.updateFullname(currentUserId, request);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Update fullname successfully", null));
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        
        userService.updatePassword(currentUserId, request);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Update password successfully", null));
    }

    @PutMapping("/email")
    public ResponseEntity<?> updateEmail(
            @Valid @RequestBody UpdateEmailRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        
        userService.updateEmail(currentUserId, request);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Update email successfully", null));
    }

    @PutMapping("/address")
    public ResponseEntity<?> updateAddress(
            @Valid @RequestBody UpdateAddressRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long currentUserId = Long.valueOf(authentication.getName());
        
        userService.updateAddress(currentUserId, request);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Update address successfully", null));
    }
}
