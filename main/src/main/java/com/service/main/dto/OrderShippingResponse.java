package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderShippingResponse {
    private Long id;
    private Long orderId;
    private String shippingAddress;
    private String trackingNumber;
    private OffsetDateTime shippedAt;
    private String deliveryStatus;
    private OffsetDateTime deliveredAt;
}
