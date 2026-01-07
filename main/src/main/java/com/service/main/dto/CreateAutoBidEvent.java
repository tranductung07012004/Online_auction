package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAutoBidEvent {
    private Long userId;
    private Long productId;
    private BigDecimal maxPrice;
}

