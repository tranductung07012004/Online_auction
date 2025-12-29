package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStats {
    // Product/Auction stats
    private long totalProducts;
    private long activeAuctions;
    private long endedAuctions;
    private long endingSoonAuctions; // ending in 24 hours
    
    // Bidding stats
    private long totalBids;
    private BigDecimal highestCurrentPrice;
    private BigDecimal averageStartPrice;
    
    // Category stats
    private long totalCategories;
    private List<CategoryProductCount> topCategories;
    
    // Recent activity counts
    private long newProductsToday;
    private long newProductsThisWeek;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryProductCount {
        private Integer categoryId;
        private String categoryName;
        private long productCount;
    }
}
