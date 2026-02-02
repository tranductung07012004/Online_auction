package com.service.integration.userclient;

import com.service.common.dto.UpdateReviewStatsRequest;
import com.service.common.dto.UserEmailItemResponse;
import com.service.common.dto.UserEmailResponse;
import com.service.common.dto.UserInfo;
import com.service.common.dto.UserInfoResponse;

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

