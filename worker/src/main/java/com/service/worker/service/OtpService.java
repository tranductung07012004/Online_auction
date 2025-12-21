package com.service.worker.service;

public interface OtpService {
    public void generateAndSendOtp(Long userId, String email);
}
