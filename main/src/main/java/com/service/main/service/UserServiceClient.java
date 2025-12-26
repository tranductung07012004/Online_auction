package com.service.main.service;

import com.service.main.dto.UserBasicInfoResponse;

public interface UserServiceClient {
    UserBasicInfoResponse getUserBasicInfo(Long userId);
}

