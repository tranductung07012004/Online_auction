package com.service.user.service.impl;

import com.service.user.dto.LoginRequest;
import com.service.user.dto.LoginResponse;
import com.service.user.dto.RegisterRequest;
import com.service.user.entity.RefreshToken;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.RefreshTokenRepository;
import com.service.user.repository.UserRepository;
import com.service.user.security.JwtUtil;
import com.service.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.service.user.entity.User;
import com.service.user.dto.TokenPair;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;

    private final RefreshTokenRepository refreshTokenRepo;

    private final JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public LoginResponse login(LoginRequest req) {
        User user = this.userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApplicationException(ApplicationException.USER_NOT_FOUND));
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApplicationException(ApplicationException.INVALID_PASSWORD);
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
            throw new ApplicationException("User already exists with email: " + req.getEmail());
        }
        User newUser = User.builder()
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();
        this.userRepo.save(newUser);
    }

    @Override
    public TokenPair generateAccessToken(String refreshTokenInCookie) {
        if (!jwtUtil.validateToken(refreshTokenInCookie)) {
            throw new ApplicationException(ApplicationException.INVALID_TOKEN);
        }

        Optional<RefreshToken> tokenObject = this.refreshTokenRepo.findByToken(refreshTokenInCookie);

        if (tokenObject.isEmpty()) {
            throw new ApplicationException(ApplicationException.UNAUTHORIZED);
        }

        RefreshToken oldToken = tokenObject.get();

        if (oldToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepo.deleteByToken(oldToken.getToken()); // cleanup
            throw new ApplicationException(ApplicationException.TOKEN_EXPIRED);
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
            throw new ApplicationException("User not found with id: " + oldToken.getUser_id());
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
