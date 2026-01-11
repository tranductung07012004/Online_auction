package com.service.main.service.impl;

import com.service.main.dto.*;
import com.service.main.entity.Order;
import com.service.main.entity.OrderPayment;
import com.service.main.entity.OrderReview;
import com.service.main.entity.OrderShipping;
import com.service.main.entity.Product;
import com.service.main.repository.OrderPaymentRepository;
import com.service.main.repository.OrderRepository;
import com.service.main.repository.OrderReviewRepository;
import com.service.main.repository.OrderShippingRepository;
import com.service.main.repository.ProductRepository;
import com.service.main.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderPaymentRepository orderPaymentRepository;
    private final OrderShippingRepository orderShippingRepository;
    private final OrderReviewRepository orderReviewRepository;

    @Override
    public Page<OrderWithProductResponse> getOrders(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());
        boolean isBuyer = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_BIDDER"));
        boolean isSeller = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SELLER"));
        Page<Order> orders;
        if (isBuyer) {
            orders = orderRepository.findAllByBuyerId(userId, pageable);
        } else if (isSeller) {
            orders = orderRepository.findAllBySellerId(userId, pageable);
        } else {
            throw new IllegalArgumentException("User does not have BIDDER or SELLER role");
        }
        return orders.map(order -> {
            Product product = productRepository.findById(order.getProductId()).orElse(null);
            OrderWithProductResponse.ProductBasicInfo productInfo = null;
            if (product != null) {
                productInfo = OrderWithProductResponse.ProductBasicInfo.builder()
                        .id(product.getId())
                        .productName(product.getProductName())
                        .thumbnailUrl(product.getThumbnailUrl())
                        .startPrice(product.getStartPrice())
                        .currentPrice(product.getCurrentPrice())
                        .buyNowPrice(product.getBuyNowPrice())
                        .build();
            }
            return OrderWithProductResponse.builder()
                    .id(order.getId())
                    .productId(order.getProductId())
                    .buyerId(order.getBuyerId())
                    .sellerId(order.getSellerId())
                    .amount(order.getAmount())
                    .status(order.getStatus())
                    .createdAt(order.getCreatedAt())
                    .isCancelled(order.getIsCancelled())
                    .cancelledReason(order.getCancelledReason())
                    .product(productInfo)
                    .build();
        });
    }

    @Override
    public OrderWithProductResponse createOrder(com.service.main.dto.CreateOrderRequest request) {
        // Fetch product to get current price
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + request.getProductId()));
        
        // Use product's current price as order amount
        Order order = Order.builder()
                .productId(request.getProductId())
                .buyerId(request.getBuyerId())
                .sellerId(request.getSellerId())
                .amount(product.getCurrentPrice())
                .createdAt(java.time.OffsetDateTime.now())
                .isCancelled(false)
                .build();
        order = orderRepository.save(order);
        
        // Auto-create payment record with PENDING status
        OrderPayment payment = OrderPayment.builder()
                .orderId(order.getId())
                .amount(order.getAmount())
                .paymentStatus("PENDING")
                .paymentMethod("BANK_TRANSFER")
                .build();
        orderPaymentRepository.save(payment);
        
        OrderWithProductResponse.ProductBasicInfo productInfo = null;
        if (product != null) {
            productInfo = OrderWithProductResponse.ProductBasicInfo.builder()
                    .id(product.getId())
                    .productName(product.getProductName())
                    .thumbnailUrl(product.getThumbnailUrl())
                    .startPrice(product.getStartPrice())
                    .currentPrice(product.getCurrentPrice())
                    .buyNowPrice(product.getBuyNowPrice())
                    .build();
        }
        return OrderWithProductResponse.builder()
                .id(order.getId())
                .productId(order.getProductId())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .amount(order.getAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .isCancelled(order.getIsCancelled())
                .cancelledReason(order.getCancelledReason())
                .product(productInfo)
                .build();
    }

    @Override
    public OrderWithProductResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));

        Product product = productRepository.findById(order.getProductId()).orElse(null);

        OrderWithProductResponse.ProductBasicInfo productInfo = null;
        if (product != null) {
            productInfo = OrderWithProductResponse.ProductBasicInfo.builder()
                    .id(product.getId())
                    .productName(product.getProductName())
                    .thumbnailUrl(product.getThumbnailUrl())
                    .startPrice(product.getStartPrice())
                    .currentPrice(product.getCurrentPrice())
                    .build();
        }

        return OrderWithProductResponse.builder()
                .id(order.getId())
                .productId(order.getProductId())
                .buyerId(order.getBuyerId())
                .sellerId(order.getSellerId())
                .amount(order.getAmount())
                .status(order.getStatus())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .isCancelled(order.getIsCancelled())
                .cancelledReason(order.getCancelledReason())
                .product(productInfo)
                .build();
    }

    // ==================== PAYMENT METHODS ====================
    
    @Override
    @Transactional
    public void uploadPaymentProof(Long orderId, UploadPaymentProofRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer can upload payment proof");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot upload proof for cancelled order");
        }

        OrderPayment payment = orderPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        if ("CONFIRMED".equals(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Payment already confirmed");
        }

        payment.setPaymentProofUrl(request.getPaymentProofUrl());
        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getNotes() != null) {
            payment.setNotes(request.getNotes());
        }
        payment.setPaymentStatus("PROOF_UPLOADED");
        payment.setBuyerPaidAt(OffsetDateTime.now());
        orderPaymentRepository.save(payment);
        
        // Update order status
        order.setStatus("PAYMENT_PROOF_UPLOADED");
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void confirmPayment(Long orderId, ConfirmPaymentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only seller can confirm payment");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot confirm payment for cancelled order");
        }

        OrderPayment payment = orderPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        if (!"PROOF_UPLOADED".equals(payment.getPaymentStatus())) {
            throw new IllegalArgumentException("Buyer must upload payment proof first");
        }

        payment.setPaymentStatus("CONFIRMED");
        payment.setSellerConfirmedAt(OffsetDateTime.now());
        if (request.getNotes() != null) {
            payment.setNotes(payment.getNotes() + "\nSeller: " + request.getNotes());
        }
        orderPaymentRepository.save(payment);
        
        // Update order status
        order.setStatus("PAYMENT_CONFIRMED");
        orderRepository.save(order);
    }

    @Override
    public OrderPaymentResponse getPaymentInfo(Long orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer or seller can view payment info");
        }

        OrderPayment payment = orderPaymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment record not found"));

        return OrderPaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentProofUrl(payment.getPaymentProofUrl())
                .buyerPaidAt(payment.getBuyerPaidAt())
                .sellerConfirmedAt(payment.getSellerConfirmedAt())
                .stripeSessionId(payment.getStripeSessionId())
                .stripePaymentUrl(payment.getStripePaymentUrl())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    // ==================== SHIPPING METHODS ====================

    @Override
    @Transactional
    public void updateShippingAddress(Long orderId, UpdateShippingAddressRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer can update shipping address");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot update cancelled order");
        }

        OrderShipping shipping = orderShippingRepository.findByOrderId(orderId)
                .orElse(OrderShipping.builder()
                        .orderId(orderId)
                        .deliveryStatus("PENDING")
                        .build());

        shipping.setShippingAddress(request.getShippingAddress());
        orderShippingRepository.save(shipping);
        
        // Update order status
        order.setStatus("ADDRESS_PROVIDED");
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void confirmShipping(Long orderId, ConfirmShippingRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only seller can confirm shipping");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot confirm cancelled order");
        }

        // Check shipping address exists
        OrderShipping shipping = orderShippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer must provide shipping address first"));

        shipping.setTrackingNumber(request.getTrackingNumber());
        shipping.setShippedAt(OffsetDateTime.now());
        shipping.setDeliveryStatus("SHIPPED");
        orderShippingRepository.save(shipping);
        
        // Update order status
        order.setStatus("SHIPPED");
        orderRepository.save(order);
    }

    @Override
    public OrderShippingResponse getShippingInfo(Long orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer or seller can view shipping info");
        }

        OrderShipping shipping = orderShippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Shipping info not found"));

        return OrderShippingResponse.builder()
                .id(shipping.getId())
                .orderId(shipping.getOrderId())
                .shippingAddress(shipping.getShippingAddress())
                .trackingNumber(shipping.getTrackingNumber())
                .shippedAt(shipping.getShippedAt())
                .deliveryStatus(shipping.getDeliveryStatus())
                .deliveredAt(shipping.getDeliveredAt())
                .build();
    }

    @Override
    @Transactional
    public void confirmDelivery(Long orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer can confirm delivery");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot confirm cancelled order");
        }

        OrderShipping shipping = orderShippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Shipping info not found"));

        if (!"SHIPPED".equals(shipping.getDeliveryStatus())) {
            throw new IllegalArgumentException("Order must be shipped before confirming delivery");
        }

        shipping.setDeliveryStatus("DELIVERED");
        shipping.setDeliveredAt(OffsetDateTime.now());
        orderShippingRepository.save(shipping);
        
        // Update order status
        order.setStatus("DELIVERED");
        orderRepository.save(order);
        
        // Trigger "money release" - Update payment seller_confirmed_at (giải ngân)
        OrderPayment payment = orderPaymentRepository.findByOrderId(orderId)
                .orElse(null);
        if (payment != null && "CONFIRMED".equals(payment.getPaymentStatus())) {
            payment.setSellerConfirmedAt(OffsetDateTime.now());
            orderPaymentRepository.save(payment);
        }
    }

    @Override
    @Transactional
    public void submitReview(Long orderId, SubmitReviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer or seller can submit review");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Cannot review cancelled order");
        }

        OrderShipping shipping = orderShippingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Shipping info not found"));

        if (!"DELIVERED".equals(shipping.getDeliveryStatus())) {
            throw new IllegalArgumentException("Order must be delivered before reviewing");
        }

        if (orderReviewRepository.existsByOrderIdAndUserId(orderId, userId)) {
            throw new IllegalArgumentException("User has already submitted review for this order");
        }

        if (request.getStatus() != 1 && request.getStatus() != -1) {
            throw new IllegalArgumentException("Status must be +1 or -1");
        }

        OrderReview review = OrderReview.builder()
                .orderId(orderId)
                .userId(userId)
                .status(request.getStatus())
                .comment(request.getComment())
                .build();

        orderReviewRepository.save(review);
        
        // Check if both parties have reviewed, update order status to REVIEWED
        long reviewCount = orderReviewRepository.countByOrderId(orderId);
        if (reviewCount >= 2) {
            order.setStatus("REVIEWED");
            orderRepository.save(order);
        }

        // TODO: Update user assessment score
        // Long reviewedUserId = userId.equals(order.getBuyerId()) ? order.getSellerId() : order.getBuyerId();
        // userService.updateAssessmentScore(reviewedUserId, request.getStatus());
    }

    @Override
    public List<OrderReviewResponse> getOrderReviews(Long orderId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getBuyerId().equals(userId) && !order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only buyer or seller can view reviews");
        }

        List<OrderReview> reviews = orderReviewRepository.findByOrderId(orderId);

        return reviews.stream()
                .map(review -> OrderReviewResponse.builder()
                        .id(review.getId())
                        .orderId(review.getOrderId())
                        .userId(review.getUserId())
                        .userFullName("User #" + review.getUserId()) // TODO: Fetch actual user name
                        .status(review.getStatus())
                        .comment(review.getComment())
                        .createdAt(review.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, CancelOrderRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getSellerId().equals(userId)) {
            throw new IllegalArgumentException("Only seller can cancel order");
        }

        if (order.getIsCancelled()) {
            throw new IllegalArgumentException("Order is already cancelled");
        }

        // Check if order has been shipped
        OrderShipping shipping = orderShippingRepository.findByOrderId(orderId).orElse(null);
        if (shipping != null && "SHIPPED".equals(shipping.getDeliveryStatus())) {
            throw new IllegalArgumentException("Cannot cancel order that has been shipped");
        }

        order.setIsCancelled(true);
        order.setCancelledReason(request.getCancelledReason());
        order.setCancelledAt(OffsetDateTime.now());
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = Long.valueOf(authentication.getName());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Check if user is buyer or seller
        boolean isBuyer = order.getBuyerId().equals(userId);
        boolean isSeller = order.getSellerId().equals(userId);

        if (!isBuyer && !isSeller) {
            throw new IllegalArgumentException("Only buyer or seller can update order status");
        }

        // Validate status value
        String newStatus = request.getStatus().trim().toUpperCase();
        String[] validStatuses = {
            "CREATED", "CONFIRMED", "ADDRESS_PROVIDED", 
            "PAYMENT_PROOF_UPLOADED", "PAYMENT_CONFIRMED", 
            "SHIPPED", "DELIVERED", "REVIEWED", "CANCELLED"
        };
        
        boolean isValidStatus = false;
        for (String validStatus : validStatuses) {
            if (validStatus.equals(newStatus)) {
                isValidStatus = true;
                break;
            }
        }
        
        if (!isValidStatus) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }

        // Check if order is already cancelled
        if (order.getIsCancelled() && !newStatus.equals("CANCELLED")) {
            throw new IllegalArgumentException("Cannot update status of cancelled order");
        }

        // Business logic checks based on status transitions
        if (newStatus.equals("CONFIRMED") && !isBuyer) {
            throw new IllegalArgumentException("Only buyer can confirm order");
        }

        if (newStatus.equals("PAYMENT_CONFIRMED") && !isSeller) {
            throw new IllegalArgumentException("Only seller can confirm payment");
        }

        if (newStatus.equals("SHIPPED") && !isSeller) {
            throw new IllegalArgumentException("Only seller can update to shipped status");
        }

        if (newStatus.equals("DELIVERED") && !isBuyer) {
            throw new IllegalArgumentException("Only buyer can confirm delivery");
        }

        // Update order status
        order.setStatus(newStatus);
        orderRepository.save(order);

        // TODO: Send notification/email about status change
        // emailService.sendOrderStatusUpdateEmail(order, request.getNotes());
    }
}
