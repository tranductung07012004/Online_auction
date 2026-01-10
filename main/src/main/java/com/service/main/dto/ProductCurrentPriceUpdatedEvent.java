package com.service.main.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductCurrentPriceUpdatedEvent {
    private Long productId;
    private BigDecimal newCurrentPrice;
    private Long oldTopBidderId;
    private Long userCreateBidId;
    private Long sellerId;
    private Long newTopBidderId;
    private String sellerEmail;
    private String userCreateBidEmail;
    private String oldTopBidderEmail;
}























