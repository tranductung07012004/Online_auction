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
public class OrderPaymentResponse {
    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentProofUrl;
    private String transactionId;
    private OffsetDateTime buyerPaidAt;
    private OffsetDateTime sellerConfirmedAt;
    private String notes;
    private OffsetDateTime createdAt;
}
