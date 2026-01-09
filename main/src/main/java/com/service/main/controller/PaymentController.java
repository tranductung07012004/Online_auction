package com.service.main.controller;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.CreatePaymentRequest;
import com.service.main.dto.PaymentResponse;
import com.service.main.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/main/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/create")
    @PreAuthorize("hasRole('BIDDER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        PaymentResponse response = paymentService.createPayment(request, httpRequest);
        return ResponseEntity.ok(new ApiResponse<>("Payment URL created successfully", response));
    }
    
    @GetMapping("/vnpay-return")
    public RedirectView vnpayReturn(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, value) -> {
            if (value != null && value.length > 0) {
                params.put(key, value[0]);
            }
        });
        
        log.info("VNPay return callback received");
        
        // Verify signature
        boolean isValid = paymentService.verifyPayment(params);
        
        if (isValid) {
            // Process payment
            paymentService.processPaymentReturn(params);
            
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                // Payment success - redirect to success page
                return new RedirectView("http://localhost:5173/payment/success?orderId=" + 
                        params.get("vnp_TxnRef").split("_")[1]);
            } else {
                // Payment failed - redirect to failure page
                return new RedirectView("http://localhost:5173/payment/failure?code=" + responseCode);
            }
        } else {
            log.error("Invalid payment signature");
            return new RedirectView("http://localhost:5173/payment/error");
        }
    }
    
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, Object>> vnpayIPN(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, value) -> {
            if (value != null && value.length > 0) {
                params.put(key, value[0]);
            }
        });
        
        Map<String, Object> response = new HashMap<>();
        
        boolean isValid = paymentService.verifyPayment(params);
        
        if (isValid) {
            try {
                paymentService.processPaymentReturn(params);
                response.put("RspCode", "00");
                response.put("Message", "Confirm Success");
            } catch (Exception e) {
                log.error("Error processing payment IPN", e);
                response.put("RspCode", "99");
                response.put("Message", "Unknown error");
            }
        } else {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Signature");
        }
        
        return ResponseEntity.ok(response);
    }
}
