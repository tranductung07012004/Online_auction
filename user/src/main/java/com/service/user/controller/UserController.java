package com.service.user.controller;

import com.service.user.dto.ApiResponse;
import com.service.user.dto.UserInfoResponse;
import com.service.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
