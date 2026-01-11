package com.service.main.service;

import com.service.main.dto.StripePaymentResponse;

public interface StripePaymentService {
    /**
     * Tạo Stripe Checkout Session cho một order
     * @param orderId ID của order cần thanh toán
     * @return StripePaymentResponse chứa sessionId và paymentUrl
     */
    StripePaymentResponse createPaymentSession(Long orderId);
}
