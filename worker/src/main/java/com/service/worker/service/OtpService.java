package com.service.worker.service;

public interface OtpService {
    public void sendVerificationLink(Long userId, String email, String otpCode);
}
