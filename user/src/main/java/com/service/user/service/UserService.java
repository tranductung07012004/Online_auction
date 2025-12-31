package com.service.user.service;

import com.service.user.dto.UpdateAddressRequest;
import com.service.user.dto.UpdateAvatarRequest;
import com.service.user.dto.UpdateEmailRequest;
import com.service.user.dto.UpdateFullnameRequest;
import com.service.user.dto.UpdatePasswordRequest;
import com.service.user.dto.UserInfoResponse;
import com.service.user.dto.UserListResponse;
import com.service.user.dto.UserProfileResponse;

import java.util.List;

public interface UserService {
    UserInfoResponse getUserBasicInfo(Long userId);
    
    List<UserListResponse> getAllUsers();
    
    void updateAvatar(Long userId, UpdateAvatarRequest request);
    
    void updateFullname(Long userId, UpdateFullnameRequest request);
    
    void updatePassword(Long userId, UpdatePasswordRequest request);
    
    void updateEmail(Long userId, UpdateEmailRequest request);
    
    void updateAddress(Long userId, UpdateAddressRequest request);
    
    UserProfileResponse getUserProfile(Long userId);
}