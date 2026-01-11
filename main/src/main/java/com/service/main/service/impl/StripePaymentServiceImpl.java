package com.service.main.service.impl;

import com.service.main.dto.StripePaymentResponse;
import com.service.main.entity.Order;
import com.service.main.entity.OrderPayment;
import com.service.main.entity.Product;
import com.service.main.repository.OrderPaymentRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.StripePaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentServiceImpl implements StripePaymentService {

    private final OrderRepository orderRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final ProductRepository productRepository;

    @Value("${stripe.secret.key:sk_test_dummy}")
    private String stripeSecretKey;

    @Value("${stripe.success.url:http://localhost:5173/order/}")
    private String stripeSuccessUrl;

    @Value("${stripe.cancel.url:http://localhost:5173/order/}")
    private String stripeCancelUrl;

    @Override
    @Transactional
    public StripePaymentResponse createPaymentSession(Long orderId) {
        // Validate user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        // Fetch order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        // Check if user is the buyer
        if (!order.getBuyerId().equals(userId)) {
            throw new IllegalArgumentException("Only the buyer can create a payment session");
        }

        // Check if order is cancelled
        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot create payment for cancelled order");
        }

        // Fetch payment record
        OrderPayment payment = orderPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        // Check if payment already confirmed
        if ("CONFIRMED".equals(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Payment already confirmed");
        }

        // Fetch product for details
        Product product = productRepository.findById(order.getProductId()).orElse(null);
        String productName = product != null ? product.getProductName() : "Order #" + orderId;

        // Initialize Stripe
        Stripe.apiKey = stripeSecretKey;

        try {
            // Convert amount to cents (Stripe requires amount in smallest currency unit)
            BigDecimal amountInCents = order.getAmount().multiply(new BigDecimal("100"));
            long amountLong = amountInCents.longValue();

            // Create Stripe Checkout Session
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(stripeSuccessUrl + orderId)
                    .setCancelUrl(stripeCancelUrl + orderId)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(amountLong)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName(productName)
                                                                    .setDescription("Payment for Order #" + orderId)
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            Session session = Session.create(params);

            // Update payment record with Stripe info
            payment.setStripeSessionId(session.getId());
            payment.setStripePaymentUrl(session.getUrl());
            payment.setPaymentMethod("STRIPE");
            orderPaymentRepository.save(payment);

            log.info("Created Stripe payment session for order {}: {}", orderId, session.getId());

            return StripePaymentResponse.builder()
                    .sessionId(session.getId())
                    .paymentUrl(session.getUrl())
                    .message("Stripe payment session created successfully")
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create Stripe session for order {}: {}", orderId, e.getMessage());
            throw new RuntimeException("Failed to create Stripe payment session: " + e.getMessage());
        }
    }
}
