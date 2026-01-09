package com.service.worker.service;

public interface OtpService {
    void sendVerificationLink(Long userId, String email, String otpCode);
}
