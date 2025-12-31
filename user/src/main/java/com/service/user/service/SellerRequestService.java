package com.service.user.service;

import com.service.user.constants.SellerRequestStatus;
import com.service.user.dto.*;

public interface SellerRequestService {
    
    /**
     * User: Create a new seller request
     */
    SellerRequestResponse createSellerRequest(Long userId, CreateSellerRequestDTO request);
    
    /**
     * User: Get own seller request
     */
    SellerRequestResponse getMySellerRequest(Long userId);
    
    /**
     * User: Cancel own pending seller request
     */
    void cancelSellerRequest(Long userId);
    
    /**
     * Admin: Get all seller requests with pagination
     */
    PageResponse<SellerRequestResponse> getAllSellerRequests(int page, int size);
    
    /**
     * Admin: Get seller requests by status with pagination
     */
    PageResponse<SellerRequestResponse> getSellerRequestsByStatus(SellerRequestStatus status, int page, int size);
    
    /**
     * Admin: Search seller requests by user email
     */
    PageResponse<SellerRequestResponse> searchSellerRequests(String keyword, int page, int size);
    
    /**
     * Admin: Get seller request by ID
     */
    SellerRequestResponse getSellerRequestById(Long requestId);
    
    /**
     * Admin: Review (approve/reject) seller request
     */
    SellerRequestResponse reviewSellerRequest(Long requestId, Long adminId, ReviewSellerRequestDTO request);
    
    /**
     * Admin: Get seller request statistics
     */
    SellerRequestStatistics getSellerRequestStatistics();
}
