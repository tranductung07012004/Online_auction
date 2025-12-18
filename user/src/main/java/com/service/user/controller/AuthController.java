package com.service.user.controller;

import com.service.user.dto.ApiResponse;
import com.service.user.dto.LoginResponse;
import com.service.user.dto.RegisterRequest;
import com.service.user.dto.LoginRequest;
import com.service.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import com.service.user.dto.TokenPair;

@RestController
@RequestMapping("/api/user/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        this.authService.register(req);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Register successfully", null));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        LoginResponse token = this.authService.login(req);
        Cookie cookie = new Cookie("tdt", token.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);

        res.addCookie(cookie);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Login successfully", token.getAccessToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "tdt", required = false) String refreshToken, HttpServletResponse res) {
        Cookie cookie = new Cookie("tdt", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");

        res.addCookie(cookie);

        this.authService.logout(refreshToken);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Logout successfully", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> getAccessToken(@CookieValue(value = "tdt", required = false) String refreshToken, HttpServletResponse res) {
        if (refreshToken == null) {
            return ResponseEntity
                    .status(401)
                    .body(new ApiResponse<>("Refresh token in cookie is missing", null));
        }
        TokenPair token = this.authService.generateAccessToken(refreshToken);

        Cookie cookie = new Cookie("tdt", token.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);

        res.addCookie(cookie);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Access token is generated successfully", token.getAccessToken()));
    }

    @GetMapping
    public ResponseEntity<?> test() {
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("haha", null));
    }
}
