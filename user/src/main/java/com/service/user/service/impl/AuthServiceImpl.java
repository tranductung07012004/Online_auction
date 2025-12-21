package com.service.user.service.impl;

import com.service.user.dto.LoginRequest;
import com.service.user.dto.LoginResponse;
import com.service.user.dto.RegisterRequest;
import com.service.user.dto.RecaptchaResponse;
import com.service.user.entity.RefreshToken;
import com.service.user.entity.UserDetails;
import com.service.user.exception.ApplicationException;
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
import com.service.user.dto.TokenPair;
import com.service.user.dto.UserRegisteredEvent;
import com.service.user.service.KafkaProducerService;
import com.service.user.constants.KafkaTopics;
import com.service.user.constants.KafkaEventTypes;
import com.service.user.constants.ErrorCodes;
import com.service.user.constants.ErrorMessages;

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

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Value("${recaptcha.secret}")
    private String recaptchaSecret;

    @Value("${recaptcha.verify-url}")
    private String recaptchaVerifyUrl;

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
        // remoteip is optional; we skip it for now

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
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApplicationException(ErrorCodes.INVALID_PASSWORD, ErrorMessages.INVALID_PASSWORD);
        }
        UserDetails userDetails = this.userDetailsRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ApplicationException(ErrorCodes.USER_NOT_FOUND, ErrorMessages.USER_NOT_FOUND));
        
        if (!userDetails.getVerified()) {
            throw new ApplicationException(ErrorCodes.USER_NOT_VERIFIED, ErrorMessages.USER_NOT_VERIFIED);
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
    public void register(RegisterRequest req) {
        Optional<User> user = this.userRepo.findByEmail(req.getEmail());
        if (!user.isEmpty()) {
            throw new ApplicationException(ErrorCodes.USER_ALREADY_EXISTS, "User already exists with email: " + req.getEmail());
        }
        User newUser = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();
        this.userRepo.save(newUser);

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

        // Publish user registered event to Kafka
        // Sử dụng userId làm key để đảm bảo tất cả events của cùng user đi vào cùng partition
        UserRegisteredEvent eventData = UserRegisteredEvent.builder()
                .userId(newUser.getId())
                .email(newUser.getEmail())
                .build();
        kafkaProducerService.sendMessageWithKey(
                KafkaTopics.REGISTER_EVENTS,
                newUser.getId().toString(), // Key = userId để đảm bảo partitioning theo user
                KafkaEventTypes.USER_REGISTERED,
                eventData
        );
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

}
