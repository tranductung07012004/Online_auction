package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentProductDTO {
    private Long id;
    private String productName;
    private String thumbnailUrl;
    private BigDecimal startPrice;
    private BigDecimal currentPrice;
    private Long sellerId;
    private Integer bidCount;
    private OffsetDateTime endAt;
    private OffsetDateTime createdAt;
    private boolean isActive;
}
