package com.service.worker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEndedEvent {
    private Long sellerId;
    private Long topBidderId; // null nếu không có winner
    private BigDecimal currentPrice;
    private String sellerEmail;
    private String topBidderEmail; // null nếu topBidderId null
    private OffsetDateTime endAt;
}
