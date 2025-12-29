package com.service.main.service;

import com.service.main.dto.AdminDashboardStats;
import com.service.main.dto.RecentProductDTO;

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
