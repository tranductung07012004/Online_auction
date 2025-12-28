package com.service.main.service;

import com.service.main.dto.UserInfoResponse;

public interface UserServiceClient {
    UserInfoResponse getUserBasicInfo(Long userId);
}

