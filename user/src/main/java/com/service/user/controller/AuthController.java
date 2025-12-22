package com.service.user.controller;

import com.service.user.dto.*;
import com.service.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;

@RestController
@RequestMapping("/api/user/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    // Tao 1 endpoint de verify otp code gui len kem gmail 
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtpToken(@Valid @RequestBody verifyOtpRequest req, HttpServletResponse res) {
        this.authService.verifyOtpCode(req);
        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("verify OTP successfully", null));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        // Verify Google reCAPTCHA token before processing registration
        // this.authService.verifyRecaptchaToken(req.getRecaptchaToken());

        RegisterResponse res = this.authService.register(req);

        return ResponseEntity
                .status(200)
                .body(new ApiResponse<>("Register successfully", res));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        // Verify Google reCAPTCHA token before processing login
        //this.authService.verifyRecaptchaToken(req.getRecaptchaToken());
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
