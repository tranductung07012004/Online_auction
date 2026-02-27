package com.service.admin.service;

import com.service.admin.dto.AdminDashboardStats;
import com.service.admin.dto.RecentProductDTO;

import java.util.List;

public interface AdminDashboardService {
    
    /**
     * Get comprehensive dashboard statistics
     */
    AdminDashboardStats getDashboardStats();
    
    /**
     * Get recent products
     */
    List<RecentProductDTO> getRecentProducts(int limit);
}
