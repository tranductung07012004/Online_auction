package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequest {
    @NotBlank(message = "Status is required")
    private String status; // CREATED, CONFIRMED, ADDRESS_PROVIDED, PAYMENT_PROOF_UPLOADED, PAYMENT_CONFIRMED, SHIPPED, DELIVERED, REVIEWED, CANCELLED
}
