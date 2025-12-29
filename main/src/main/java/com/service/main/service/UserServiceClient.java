package com.service.main.service;

import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;

public interface UserServiceClient {
    UserInfoResponse getUserBasicInfo(Long userId);
    
    /**
     * Get user info by ID including email
     */
    UserInfo getUserInfoById(Long userId);
}

