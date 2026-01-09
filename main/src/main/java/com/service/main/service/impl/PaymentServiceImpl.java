package com.service.main.service.impl;

import com.service.main.config.VNPayConfig;
import com.service.main.dto.CreatePaymentRequest;
import com.service.main.dto.PaymentResponse;
import com.service.main.entity.Order;
import com.service.main.entity.OrderPayment;
import com.service.main.repository.OrderPaymentRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.service.PaymentService;
import com.service.main.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    
    private final VNPayConfig vnPayConfig;
    private final OrderRepository orderRepository;
    private final OrderPaymentRepository orderPaymentRepository;

    @Override
    public PaymentResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest) {
        // Validate order exists
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        // Validate payment not already confirmed
        OrderPayment payment = orderPaymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));
        
        if ("CONFIRMED".equals(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Payment already confirmed");
        }
        
        // Create VNPay payment URL
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = "ORDER_" + order.getId() + "_" + System.currentTimeMillis();
        String vnp_IpAddr = VNPayUtil.getIpAddress(httpRequest);
        String vnp_TmnCode = vnPayConfig.getTmnCode();
        
        // Amount in VND (multiply by 100 as VNPay requires smallest unit)
        long amount = order.getAmount().longValue() * 100;
        
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        
        if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
            vnp_Params.put("vnp_BankCode", request.getBankCode());
        }
        
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + order.getId());
        vnp_Params.put("vnp_OrderType", "other");
        
        String locate = request.getLanguage() != null ? request.getLanguage() : "vn";
        vnp_Params.put("vnp_Locale", locate);
        
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        
        // Build hash data
        String hashData = VNPayUtil.hashAllFields(vnp_Params);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        
        log.info("=== VNPay Payment URL Generation ===");
        log.info("TMN Code: {}", vnPayConfig.getTmnCode());
        log.info("Hash Secret Length: {}", vnPayConfig.getHashSecret().length());
        log.info("Hash Data: {}", hashData);
        log.info("Secure Hash: {}", vnpSecureHash);
        
        // Build query string with SORTED parameters
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder query = new StringBuilder();
        
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    query.append('&');
                } catch (UnsupportedEncodingException e) {
                    log.error("Error encoding URL parameter", e);
                }
            }
        }
        
        query.append("vnp_SecureHash=").append(vnpSecureHash);
        
        String paymentUrl = vnPayConfig.getVnpUrl() + "?" + query.toString();
        
        // Update payment record with transaction reference
        payment.setTransactionId(vnp_TxnRef);
        payment.setPaymentMethod("VNPAY");
        orderPaymentRepository.save(payment);
        
        return PaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .message("Payment URL created successfully")
                .build();
    }

    @Override
    public boolean verifyPayment(Map<String, String> params) {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");
        
        String hashData = VNPayUtil.hashAllFields(params);
        String checkSum = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        
        return checkSum.equals(vnp_SecureHash);
    }

    @Override
    @Transactional
    public void processPaymentReturn(Map<String, String> params) {
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TransactionNo = params.get("vnp_TransactionNo");
        String vnp_BankCode = params.get("vnp_BankCode");
        String vnp_CardType = params.get("vnp_CardType");
        
        log.info("Processing payment return: txnRef={}, responseCode={}, transactionNo={}", 
                vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo);
        
        // Find payment by transaction reference
        OrderPayment payment = orderPaymentRepository.findByTransactionId(vnp_TxnRef)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for transaction: " + vnp_TxnRef));
        
        // Check if payment already processed
        if ("CONFIRMED".equals(payment.getPaymentStatus())) {
            log.warn("Payment already confirmed: {}", vnp_TxnRef);
            return;
        }
        
        // Update payment based on response code
        if ("00".equals(vnp_ResponseCode)) {
            // Payment success
            payment.setPaymentStatus("CONFIRMED");
            payment.setVnpayTransactionNo(vnp_TransactionNo);
            payment.setBuyerPaidAt(OffsetDateTime.now());
            
            // Store additional info in notes
            Map<String, String> paymentInfo = new HashMap<>();
            paymentInfo.put("bank_code", vnp_BankCode);
            paymentInfo.put("card_type", vnp_CardType);
            paymentInfo.put("response_code", vnp_ResponseCode);
            payment.setNotes(paymentInfo.toString());
            
            orderPaymentRepository.save(payment);
            
            // Update order status
            Order order = orderRepository.findById(payment.getOrderId())
                    .orElseThrow(() -> new IllegalArgumentException("Order not found"));
            order.setStatus("PAYMENT_CONFIRMED");
            orderRepository.save(order);
            
            log.info("Payment confirmed successfully for order: {}", order.getId());
        } else {
            // Payment failed
            payment.setPaymentStatus("FAILED");
            payment.setNotes("Payment failed with code: " + vnp_ResponseCode);
            orderPaymentRepository.save(payment);
            
            log.warn("Payment failed for order: {} with code: {}", payment.getOrderId(), vnp_ResponseCode);
        }
    }
}
