package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripePaymentResponse {
    private String sessionId;
    private String paymentUrl;
    private String message;
}
