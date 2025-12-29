package com.service.user.service;

import com.service.user.dto.AdminDashboardUserStats;
import com.service.user.dto.RecentUserDTO;

import java.util.List;

public interface AdminDashboardService {
    
    /**
     * Get comprehensive user statistics for admin dashboard
     */
    AdminDashboardUserStats getUserStatistics();
    
    /**
     * Get recent registered users
     */
    List<RecentUserDTO> getRecentUsers(int limit);
}
