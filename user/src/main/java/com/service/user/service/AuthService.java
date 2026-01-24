package com.service.user.service;

import com.service.user.dto.*;

public interface AuthService {
    void verifyOtpCode(verifyOtpRequest req);

    RegisterResponse register(RegisterRequest req);

    void verifyRecaptchaToken(String recaptchaToken);

    LoginResponse login(LoginRequest req);

    void logout(String token);

    TokenPair generateAccessToken(String token);
}