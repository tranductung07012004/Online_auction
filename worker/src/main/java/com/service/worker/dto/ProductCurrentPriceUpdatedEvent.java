package com.service.worker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCurrentPriceUpdatedEvent {
    private Long productId;
    private BigDecimal newCurrentPrice;
}
