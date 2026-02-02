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
public class OrderWithProductResponse {
    private Long id;
    private Long productId;
    private Long buyerId;
    private Long sellerId;
    private BigDecimal amount;
    private String status; // CREATED, CONFIRMED, ADDRESS_PROVIDED, PAYMENT_PROOF_UPLOADED, PAYMENT_CONFIRMED, SHIPPED, DELIVERED, REVIEWED, CANCELLED
    private OffsetDateTime createdAt;
    private Boolean isCancelled;
    private String cancelledReason;
    private OffsetDateTime cancelledAt;
    private ProductBasicInfo product;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductBasicInfo {
        private Long id;
        private String productName;
        private String thumbnailUrl;
        private BigDecimal startPrice;
        private BigDecimal currentPrice;
        private BigDecimal buyNowPrice;
    }
}
