package com.service.product.dto.blacklist.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBlackListRequest {
    
    @NotNull(message = "Bidder ID is required")
    private Long bidderId;
    
    @NotNull(message = "Product ID is required")
    private Long productId;
}

