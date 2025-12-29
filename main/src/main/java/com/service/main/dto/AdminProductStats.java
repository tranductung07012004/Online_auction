package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Statistics response for admin product management
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProductStats {
    private long totalProducts;
    private long activeProducts;
    private long endedProducts;
    private long cancelledProducts;
    private long productsWithBids;
    private long productsWithoutBids;
    private long productsEndingSoon; // within 24 hours
}
