package com.service.main.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAutoBidRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Max price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Max price must be greater than 0")
    private BigDecimal maxPrice;
}
