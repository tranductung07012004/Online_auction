package com.service.user.service.impl;

import com.service.user.dto.*;
import com.service.user.entity.OtpCode;
import com.service.user.entity.RefreshToken;
import com.service.user.entity.UserDetails;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.OtpCodeRepository;
import com.service.user.repository.RefreshTokenRepository;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.security.JwtUtil;
import com.service.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import com.service.user.entity.User;
import com.service.user.service.KafkaProducerService;
import com.service.user.constants.KafkaTopics;
import com.service.user.constants.KafkaEventTypes;
import com.service.user.constants.ErrorCodes;
import com.service.user.constants.ErrorMessages;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;

    private final RefreshTokenRepository refreshTokenRepo;

    private final UserDetailsRepository userDetailsRepo;

    private final JwtUtil jwtUtil;

    private final KafkaProducerService kafkaProducerService;

    private final OtpCodeRepository otpCodeRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();


    @Value("${recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${recaptcha.verify-url}")
    private String recaptchaVerifyUrl;

    @Value("${otp.expiry-minutes}")
    private int otpExpiryMinutes;


    @Override
    public void verifyRecaptchaToken(String recaptchaToken) {
        if (recaptchaToken == null || recaptchaToken.trim().isEmpty()) {
            throw new ApplicationException(ErrorCodes.RECAPTCHA_TOKEN_MISSING, "reCAPTCHA token is missing");
        }

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("secret", recaptchaSecret);
        body.add("response", recaptchaToken);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        RecaptchaResponse response = restTemplate.postForObject(
                recaptchaVerifyUrl,
                request,
                RecaptchaResponse.class
        );

        System.out.println(response.isSuccess());

        if (response == null || !response.isSuccess()) {
            throw new ApplicationException(ErrorCodes.RECAPTCHA_VERIFICATION_FAILED, "reCAPTCHA verification failed");
        }
    }

    @Override
    public LoginResponse login(LoginRequest req) {
        User user = this.userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApplicationException(ErrorCodes.USER_NOT_FOUND, ErrorMessages.USER_NOT_FOUND));
        UserDetails userDetails = this.userDetailsRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ApplicationException(ErrorCodes.USER_NOT_FOUND, ErrorMessages.USER_NOT_FOUND));
        
        if (!userDetails.getVerified()) {
            throw new ApplicationException(ErrorCodes.USER_NOT_VERIFIED, ErrorMessages.USER_NOT_VERIFIED);
        }
        
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApplicationException(ErrorCodes.INVALID_PASSWORD, ErrorMessages.INVALID_PASSWORD);
        }
        String accessToken = this.jwtUtil.generateAccessToken(user.getId().toString(), user.getRole());
        String refreshToken = this.jwtUtil.generateRefreshToken(user.getId().toString());
        RefreshToken refreshTokenObject = RefreshToken.builder()
                .user_id(user.getId())
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        this.refreshTokenRepo.save(refreshTokenObject);
        return new LoginResponse(accessToken, refreshToken);
    }

    @Override
    public RegisterResponse register(RegisterRequest req) {
        Optional<User> user = this.userRepo.findByEmail(req.getEmail());
        if (!user.isEmpty()) {
            throw new ApplicationException(ErrorCodes.USER_ALREADY_EXISTS, "User already exists with email: " + req.getEmail());
        }
        User newUser = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();
        User savedUser = this.userRepo.save(newUser);

        UserDetails userDetails = UserDetails.builder()
                .user_id(newUser.getId())
                .fullname(req.getFullname())
                .address(req.getAddress())
                .verified(false)
                .like_count(0)
                .dislike_count(0)
                .created_at(LocalDateTime.now())
                .build();
        this.userDetailsRepo.save(userDetails);

        String otpCode = generateOtp();
        
        String otpHash = encoder.encode(otpCode);
        
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
        
        OtpCode otpEntity = OtpCode.builder()
                .userId(newUser.getId())
                .email(newUser.getEmail())
                .purpose("VERIFY_EMAIL")
                .otpHash(otpHash)
                .expiresAt(expiresAt)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        this.otpCodeRepository.save(otpEntity);

        // Publish user registered event to Kafka with OTP code
        UserRegisteredEvent eventData = UserRegisteredEvent.builder()
                .userId(newUser.getId())
                .email(newUser.getEmail())
                .otpCode(otpCode)
                .build();
        kafkaProducerService.sendMessageWithKey(
                KafkaTopics.REGISTER_EVENTS,
                newUser.getId().toString(), // Key = userId để đảm bảo partitioning theo user
                KafkaEventTypes.USER_REGISTERED,
                eventData
        );

        RegisterResponse res = new RegisterResponse();
        res.setEmail(savedUser.getEmail());
        res.setRole(savedUser.getRole());
        res.setUserId(savedUser.getId());

        return res;
    }

    @Override
    public TokenPair generateAccessToken(String refreshTokenInCookie) {
        if (!jwtUtil.validateToken(refreshTokenInCookie)) {
            throw new ApplicationException(ErrorCodes.INVALID_TOKEN, ErrorMessages.INVALID_TOKEN);
        }

        Optional<RefreshToken> tokenObject = this.refreshTokenRepo.findByToken(refreshTokenInCookie);

        if (tokenObject.isEmpty()) {
            throw new ApplicationException(ErrorCodes.UNAUTHORIZED, ErrorMessages.UNAUTHORIZED);
        }

        RefreshToken oldToken = tokenObject.get();

        if (oldToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepo.deleteByToken(oldToken.getToken()); // cleanup
            throw new ApplicationException(ErrorCodes.TOKEN_EXPIRED, ErrorMessages.TOKEN_EXPIRED);
        }

        // Delete old token before creating a new one => token rotation to prevent replay attack
        this.refreshTokenRepo.deleteByToken(refreshTokenInCookie);

        String newRefreshTokenString = this.jwtUtil.generateRefreshToken(oldToken.getUser_id().toString());
        RefreshToken newRefreshTokenObject = RefreshToken.builder()
                .user_id(oldToken.getUser_id())
                .token(newRefreshTokenString)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        this.refreshTokenRepo.save(newRefreshTokenObject);

        Optional<User> userObject = this.userRepo.findById(oldToken.getUser_id());

        if (userObject.isEmpty()) {
            throw new ApplicationException(ErrorCodes.USER_NOT_FOUND, "User not found with id: " + oldToken.getUser_id());
        }

        User user = userObject.get();

        String accessToken = this.jwtUtil.generateAccessToken(user.getId().toString(), user.getRole());

        return new TokenPair(accessToken, newRefreshTokenString);
    }

    @Override
    public void logout(String refreshToken) {
        this.refreshTokenRepo.deleteByToken(refreshToken);
    }

    @Override
    public void verifyOtpCode(verifyOtpRequest req) {
        String email = req.getEmail();
        Long userId = req.getUserId();
        String otpCode = req.getOtp();


        if (email == null || email.trim().isEmpty() || otpCode == null || otpCode.trim().isEmpty() || userId == null) {
            throw new ApplicationException(ErrorCodes.INVALID_INPUT, ErrorMessages.INVALID_INPUT);
        }

        OtpCode otpCodeRecord = this.otpCodeRepository.findLatestActiveOtp(userId, email)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.OTP_NOT_FOUND, ErrorMessages.OTP_NOT_FOUND));

        LocalDateTime expirationTime = otpCodeRecord.getCreatedAt().plusMinutes(otpExpiryMinutes);
        if (expirationTime.isBefore(LocalDateTime.now())) {
            throw new ApplicationException(ErrorCodes.OTP_EXPIRED, ErrorMessages.OTP_EXPIRED);
        }

        if (!encoder.matches(otpCode, otpCodeRecord.getOtpHash())) {
            throw new ApplicationException(ErrorCodes.OTP_INVALID, ErrorMessages.OTP_INVALID);
        }

        otpCodeRecord.setUsed(true);
        this.otpCodeRepository.save(otpCodeRecord);

        UserDetails userDetails = this.userDetailsRepo.findByUserId(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCodes.USER_NOT_FOUND, ErrorMessages.USER_NOT_FOUND));
        userDetails.setVerified(true);
        this.userDetailsRepo.save(userDetails);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();

        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

}
