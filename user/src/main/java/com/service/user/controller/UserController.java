package com.service.user.controller;

import com.service.user.dto.ApiResponse;
import com.service.user.dto.UserInfoResponse;
import com.service.user.dto.UserListResponse;
import com.service.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/internal")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
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
}
