package com.service.worker.service.impl;

import com.service.worker.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpServiceImpl.class);

    @Value("${otp.expiry-minutes}")
    private int otpExpiryMinutes;
    
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;


    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationLink(Long userId, String email, String otpCode) {
        try {
            String verificationLink = String.format("%s/verify-email?otp=%s&email=%s&userId=%d", 
                    frontendBaseUrl, otpCode, email, userId);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Verify Your Email Address");
            message.setText(String.format(
                    "Welcome! Please verify your email address by clicking the link below:\n\n" +
                    "%s\n\n" +
                    "This link will expire in %d minutes.\n\n" +
                    "If you did not create an account, please ignore this email.",
                    verificationLink, otpExpiryMinutes
            ));
            
            mailSender.send(message);
            logger.info("Verification link email sent successfully to: {} for userId: {}", email, userId);
        } catch (Exception e) {
            logger.error("Failed to send verification link email to: {} for userId: {}", email, userId, e);
            throw new RuntimeException("Failed to send verification link email", e);
        }
    }
}

