package com.service.user.service;

import com.service.user.dto.LoginRequest;
import com.service.user.dto.LoginResponse;
import com.service.user.dto.RegisterRequest;
import com.service.user.dto.TokenPair;

public interface AuthService {
    public void register(RegisterRequest req);

    public LoginResponse login(LoginRequest req);

    public void logout(String token);

    public TokenPair generateAccessToken(String token);
}