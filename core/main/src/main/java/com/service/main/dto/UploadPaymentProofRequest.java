package com.service.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UploadPaymentProofRequest {
    private String paymentProofUrl;
    private String paymentMethod; // Optional: BANK_TRANSFER, PAYPAL, etc.
    private String notes; // Optional: Ghi chú từ buyer
}
