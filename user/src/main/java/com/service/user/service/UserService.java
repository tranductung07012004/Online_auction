package com.service.user.service;

import com.service.user.dto.UserBasicInfoResponse;

public interface UserService {
    UserBasicInfoResponse getUserBasicInfo(Long userId);
}