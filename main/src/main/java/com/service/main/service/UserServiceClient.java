package com.service.main.service;

import com.service.main.dto.UpdateReviewStatsRequest;
import com.service.main.dto.UserEmailItemResponse;
import com.service.main.dto.UserEmailResponse;
import com.service.main.dto.UserInfo;
import com.service.main.dto.UserInfoResponse;

import java.util.List;

public interface UserServiceClient {
    UserInfoResponse getUserBasicInfo(Long userId);
    
    /**
     * Get user info by ID, this does not include email, email set to null
     */
    UserInfo getUserInfoById(Long userId);
    
    /**
     * Update review stats (like/dislike) for a user
     */
    void updateReviewStats(UpdateReviewStatsRequest request);
    
    /**
     * Get user email by userId
     */
    UserEmailResponse getUserEmail(Long userId);
    
    /**
     * Get user emails by multiple userIds
     */
    List<UserEmailItemResponse> getUserEmails(List<Long> userIds);
}

