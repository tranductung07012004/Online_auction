package com.service.main.service;

import com.service.main.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    Page<OrderWithProductResponse> getOrders(Pageable pageable);

    OrderWithProductResponse createOrder(com.service.main.dto.CreateOrderRequest request);

    OrderWithProductResponse getOrderById(Long orderId);

    // Payment methods
    void uploadPaymentProof(Long orderId, UploadPaymentProofRequest request);

    void confirmPayment(Long orderId, ConfirmPaymentRequest request);

    OrderPaymentResponse getPaymentInfo(Long orderId);

    // Shipping methods
    void updateShippingAddress(Long orderId, UpdateShippingAddressRequest request);

    void confirmShipping(Long orderId, ConfirmShippingRequest request);

    OrderShippingResponse getShippingInfo(Long orderId);

    // Delivery methods
    void confirmDelivery(Long orderId);

    // Review methods
    void submitReview(Long orderId, SubmitReviewRequest request);

    List<OrderReviewResponse> getOrderReviews(Long orderId);

    // Cancel methods
    void cancelOrder(Long orderId, CancelOrderRequest request);

    // Update order status
    void updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
}
