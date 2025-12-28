package com.service.user.service;

import com.service.user.dto.UserInfoResponse;

public interface UserService {
    UserInfoResponse getUserBasicInfo(Long userId);
}