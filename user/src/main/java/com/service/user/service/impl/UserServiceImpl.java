package com.service.user.service.impl;

import com.service.user.constants.ErrorCodes;
import com.service.user.dto.UserInfoResponse;
import com.service.user.entity.User;
import com.service.user.entity.UserDetails;
import com.service.user.exception.ApplicationException;
import com.service.user.repository.UserDetailsRepository;
import com.service.user.repository.UserRepository;
import com.service.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
