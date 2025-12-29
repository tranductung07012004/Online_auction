package com.service.user.service.impl;

import com.service.user.constants.ErrorCodes;
import com.service.user.dto.UserInfoResponse;
import com.service.user.dto.UserListResponse;
import com.service.user.entity.User;
import com.service.user.entity.UserDetails;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepo;
    private final UserDetailsRepository userDetailsRepo;

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
}
