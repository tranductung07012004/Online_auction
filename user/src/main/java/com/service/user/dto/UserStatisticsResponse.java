package com.service.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatisticsResponse {
    private long totalUsers;
    private long adminCount;
    private long sellerCount;
    private long bidderCount;
    private long userCount;
    private long pendingSellerRequests;
}
