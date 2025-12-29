package com.service.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardUserStats {
    // User counts
    private long totalUsers;
    private long adminCount;
    private long sellerCount;
    private long bidderCount;
    
    // Verification stats
    private long verifiedUsers;
    private long unverifiedUsers;
    
    // Seller request stats
    private long pendingSellerRequests;
    private long approvedSellerRequests;
    private long rejectedSellerRequests;
    
    // Recent activity
    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUsersThisMonth;
}
