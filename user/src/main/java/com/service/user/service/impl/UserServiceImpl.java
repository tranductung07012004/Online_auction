package com.service.user.service.impl;

import com.service.user.constants.ErrorCodes;
import com.service.user.constants.ErrorMessages;
import com.service.user.dto.UpdateAddressRequest;
import com.service.user.dto.UpdateAvatarRequest;
import com.service.user.dto.UpdateEmailRequest;
import com.service.user.dto.UpdateFullnameRequest;
import com.service.user.dto.UpdatePasswordRequest;
import com.service.user.dto.UpdateReviewStatsRequest;
import com.service.user.dto.UserInfoResponse;
import com.service.user.dto.UserListResponse;
import com.service.user.dto.UserProfileResponse;
import com.service.user.entity.User;
import com.service.user.entity.UserDetails;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final UserDetailsRepository userDetailsRepo;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public UserInfoResponse getUserBasicInfo(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_NOT_FOUND,
                                "User not found"
                        )
                );

        UserDetails details = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_DETAILS_NOT_FOUND,
                                "User details not found"
                        )
                );

        return new UserInfoResponse(
                user.getId(),
                details.getFullname(),
                details.getAvatar(),
                details.getLike_count(),
                details.getDislike_count()
        );
    }

    @Override
    public List<UserListResponse> getAllUsers() {
        List<User> users = userRepo.findAll();
        
        return users.stream().map(user -> {
            Optional<UserDetails> detailsOpt = userDetailsRepo.findByUserId(user.getId());
            
            UserListResponse.UserListResponseBuilder builder = UserListResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole());
            
            if (detailsOpt.isPresent()) {
                UserDetails details = detailsOpt.get();
                builder.fullname(details.getFullname())
                        .avatar(details.getAvatar())
                        .address(details.getAddress())
                        .verified(details.getVerified())
                        .likeCount(details.getLike_count())
                        .dislikeCount(details.getDislike_count())
                        .createdAt(details.getCreated_at());
            }
            
            return builder.build();
        }).collect(Collectors.toList());
    }

    @Override
    public void updateAvatar(Long userId, UpdateAvatarRequest request) {
        UserDetails userDetails = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_DETAILS_NOT_FOUND,
                                "User details not found"
                        )
                );

        userDetails.setAvatar(request.getAvatar());
        userDetailsRepo.save(userDetails);
    }

    @Override
    public void updateFullname(Long userId, UpdateFullnameRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_NOT_FOUND,
                                "User not found"
                        )
                );

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_PASSWORD,
                    ErrorMessages.INVALID_PASSWORD
            );
        }

        UserDetails userDetails = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_DETAILS_NOT_FOUND,
                                "User details not found"
                        )
                );

        userDetails.setFullname(request.getFullname());
        userDetailsRepo.save(userDetails);
    }

    @Override
    public void updatePassword(Long userId, UpdatePasswordRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_NOT_FOUND,
                                "User not found"
                        )
                );

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_PASSWORD,
                    ErrorMessages.INVALID_PASSWORD
            );
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepo.save(user);
    }

    @Override
    public void updateEmail(Long userId, UpdateEmailRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_NOT_FOUND,
                                "User not found"
                        )
                );

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_PASSWORD,
                    ErrorMessages.INVALID_PASSWORD
            );
        }

        // Check if new email already exists
        Optional<User> existingUser = userRepo.findByEmail(request.getNewEmail());
        if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
            throw new ApplicationException(
                    ErrorCodes.USER_ALREADY_EXISTS,
                    "Email already exists"
            );
        }

        // Update email
        user.setEmail(request.getNewEmail());
        userRepo.save(user);
    }

    @Override
    public void updateAddress(Long userId, UpdateAddressRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_NOT_FOUND,
                                "User not found"
                        )
                );

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_PASSWORD,
                    ErrorMessages.INVALID_PASSWORD
            );
        }

        UserDetails userDetails = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_DETAILS_NOT_FOUND,
                                "User details not found"
                        )
                );

        userDetails.setAddress(request.getAddress());
        userDetailsRepo.save(userDetails);
    }

    @Override
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_NOT_FOUND,
                                "User not found"
                        )
                );

        UserDetails details = userDetailsRepo.findByUserId(userId)
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_DETAILS_NOT_FOUND,
                                "User details not found"
                        )
                );

        // Calculate assessment
        Double like = details.getLike_count().doubleValue();
        Double dislike = details.getDislike_count().doubleValue();
        Double assessment = null;

        if (like == 0 && dislike == 0) {
            assessment = null;
        } else if (dislike == 1 && like == 0) {
            assessment = null;
            // First assessment for a user maybe not accurate
            // so let them have another chance by set it to null
            // meaning that they have not received any assessments yet.
        } else {
            assessment = like / (like + dislike) * 10;
        }

        // Mask email
        String maskedEmail = maskEmail(user.getEmail());

        return UserProfileResponse.builder()
                .fullname(details.getFullname())
                .avatar(details.getAvatar())
                .assessment(assessment)
                .email(maskedEmail)
                .address(details.getAddress())
                .build();
    }

    @Override
    public void updateReviewStats(UpdateReviewStatsRequest request, Long currentUserId) {
        // Prevent self-review stats update
        if (currentUserId.equals(request.getReceiverId())) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_INPUT,
                    "Cannot update review stats for yourself"
            );
        }

        // Validate type
        if (request.getType() == null || 
            (!request.getType().equalsIgnoreCase("like") && 
             !request.getType().equalsIgnoreCase("dislike"))) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_INPUT,
                    "Type must be 'like' or 'dislike'"
            );
        }

        // Get user details for receiver
        UserDetails userDetails = userDetailsRepo.findByUserId(request.getReceiverId())
                .orElseThrow(() ->
                        new ApplicationException(
                                ErrorCodes.USER_DETAILS_NOT_FOUND,
                                "User details not found for receiver"
                        )
                );

        // Validate amount is not null
        if (request.getAmount() == null) {
            throw new ApplicationException(
                    ErrorCodes.INVALID_INPUT,
                    "Amount is required"
            );
        }

        // Update like or dislike count
        if ("like".equalsIgnoreCase(request.getType())) {
            int newLikeCount = userDetails.getLike_count() + request.getAmount();
            // Ensure like_count doesn't go below 0
            userDetails.setLike_count(Math.max(0, newLikeCount));
        } else {
            int newDislikeCount = userDetails.getDislike_count() + request.getAmount();
            // Ensure dislike_count doesn't go below 0
            userDetails.setDislike_count(Math.max(0, newDislikeCount));
        }

        this.userDetailsRepo.save(userDetails);
    }

    private String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return email;
        }

        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }

        String localPart = email.substring(0, atIndex);
        String domain = email.substring(atIndex);

        if (localPart.length() <= 1) {
            return "***" + domain;
        }

        // Keep first character, mask the rest
        String maskedLocal = localPart.charAt(0) + "***";
        return maskedLocal + domain;
    }
}
