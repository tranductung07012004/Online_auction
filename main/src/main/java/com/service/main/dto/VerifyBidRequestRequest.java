package com.service.main.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyBidRequestRequest {
    
    @NotNull(message = "Bidder ID is required")
    private Long bidderId;
    
    @NotNull(message = "Product ID is required")
    private Long productId;
}


