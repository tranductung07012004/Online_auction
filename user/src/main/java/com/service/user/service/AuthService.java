package com.service.user.service;

import com.service.user.dto.*;

public interface AuthService {
    public void verifyOtpCode(verifyOtpRequest req);

    public RegisterResponse register(RegisterRequest req);

    public void verifyRecaptchaToken(String recaptchaToken);

    public LoginResponse login(LoginRequest req);

    public void logout(String token);

    public TokenPair generateAccessToken(String token);
}