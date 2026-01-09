package com.service.main.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductCurrentPriceUpdatedEvent {
    private Long productId;
    private BigDecimal newCurrentPrice;
}





















