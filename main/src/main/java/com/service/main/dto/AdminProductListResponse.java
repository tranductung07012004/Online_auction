package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO for admin product list - simplified version for table display
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProductListResponse {
    private Long id;
    private String productName;
    private String thumbnailUrl;
    private BigDecimal startPrice;
    private BigDecimal currentPrice;
    private BigDecimal buyNowPrice;
    private Integer bidCount;
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private Long topBidderId;
    private String topBidderName;
    private String categoryName;
    private OffsetDateTime createdAt;
    private OffsetDateTime endAt;
    private String status; // ACTIVE, ENDED, CANCELLED
}
