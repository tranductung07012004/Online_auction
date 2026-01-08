package com.service.main.service;

import com.service.main.dto.CreatePaymentRequest;
import com.service.main.dto.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {
    PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest);
    
    boolean verifyPayment(Map<String, String> params);
    
    void processPaymentReturn(Map<String, String> params);
}
