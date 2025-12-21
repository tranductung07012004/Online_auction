package com.service.worker.service.impl;

import com.service.worker.entity.OtpCode;
import com.service.worker.repository.OtpCodeRepository;
import com.service.worker.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpServiceImpl.class);
    private static final SecureRandom random = new SecureRandom();

    @Value("${otp.expiry-minutes}")
    private int otpExpiryMinutes;

    private final OtpCodeRepository otpCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Override
    @Transactional
    public void generateAndSendOtp(Long userId, String email) {
        // Generate 6-digit OTP
        String otpCode = this.generateOtp();
        
        // Hash the OTP before storing
        String otpHash = this.passwordEncoder.encode(otpCode);
        
        // Calculate expiration time
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
        
        // Create and save OTP entity
        OtpCode otpEntity = OtpCode.builder()
                .userId(userId)
                .email(email)
                .purpose("VERIFY_EMAIL")
                .otpHash(otpHash)
                .expiresAt(expiresAt)
                .used(false)
                .retryCount(0)
                .createdAt(LocalDateTime.now())
                .build();
        
        this.otpCodeRepository.save(otpEntity);
        logger.info("OTP saved to database for userId: {}, email: {}", userId, email);
        
        // Send email with OTP
        this.sendOtpEmail(email, otpCode);
        
        logger.info("OTP generated and sent successfully for userId: {}, email: {}", userId, email);
    }

    private String generateOtp() {
        // Generate 6-digit OTP (000000 to 999999)
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void sendOtpEmail(String to, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Your OTP Code");
            message.setText("This is your OTP code: " + otpCode + "\nIt will expire in " + otpExpiryMinutes + " minutes.");
            
            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}

