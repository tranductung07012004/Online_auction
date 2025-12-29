package com.service.user.service;

import com.service.user.dto.UserInfoResponse;
import com.service.user.dto.UserListResponse;

import java.util.List;

public interface UserService {
    UserInfoResponse getUserBasicInfo(Long userId);
    
    List<UserListResponse> getAllUsers();
}