package com.service.main.controller;

import com.service.main.dto.*;
import com.service.main.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/main/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping("")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<Page<OrderWithProductResponse>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Sort by createdAt descending (newest first)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<OrderWithProductResponse> orders = orderService.getOrders(pageable);
        return ResponseEntity.ok(new ApiResponse<>("Orders retrieved successfully", orders));
    }

    @PostMapping("")
    public ResponseEntity<ApiResponse<OrderWithProductResponse>> createOrder(@RequestBody CreateOrderRequest request) {
        OrderWithProductResponse order = orderService.createOrder(request);
        return ResponseEntity.status(201).body(new ApiResponse<>("Order created successfully", order));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<OrderWithProductResponse>> getOrderById(@PathVariable Long orderId) {
        OrderWithProductResponse order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(new ApiResponse<>("Order retrieved successfully", order));
    }
    
    // ==================== Payment Management ====================
    
    @PostMapping("/{orderId}/payment/upload-proof")
    @PreAuthorize("hasRole('BIDDER')")
    public ResponseEntity<ApiResponse<String>> uploadPaymentProof(
            @PathVariable Long orderId,
            @RequestBody UploadPaymentProofRequest request
    ) {
        orderService.uploadPaymentProof(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>("Payment proof uploaded successfully", null));
    }
    
    @PostMapping("/{orderId}/payment/confirm")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<String>> confirmPayment(
            @PathVariable Long orderId,
            @RequestBody ConfirmPaymentRequest request
    ) {
        orderService.confirmPayment(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>("Payment confirmed successfully", null));
    }
    
    @GetMapping("/{orderId}/payment")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<OrderPaymentResponse>> getPaymentInfo(@PathVariable Long orderId) {
        OrderPaymentResponse payment = orderService.getPaymentInfo(orderId);
        return ResponseEntity.ok(new ApiResponse<>("Payment information retrieved successfully", payment));
    }
    
    // ==================== Shipping Management ====================
    
    @PostMapping("/{orderId}/shipping")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<String>> updateShippingAddress(
            @PathVariable Long orderId,
            @RequestBody UpdateShippingAddressRequest request
    ) {
        orderService.updateShippingAddress(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>("Shipping address updated successfully", null));
    }
    
    @PostMapping("/{orderId}/confirm-shipping")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<String>> confirmShipping(
            @PathVariable Long orderId,
            @RequestBody ConfirmShippingRequest request
    ) {
        orderService.confirmShipping(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>("Shipping confirmed successfully", null));
    }
    
    @GetMapping("/{orderId}/shipping")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<OrderShippingResponse>> getShippingInfo(@PathVariable Long orderId) {
        OrderShippingResponse shipping = orderService.getShippingInfo(orderId);
        return ResponseEntity.ok(new ApiResponse<>("Shipping information retrieved successfully", shipping));
    }
    
    // ==================== Delivery Confirmation ====================
    
    @PostMapping("/{orderId}/confirm-delivery")
    @PreAuthorize("hasRole('BIDDER')")
    public ResponseEntity<ApiResponse<String>> confirmDelivery(@PathVariable Long orderId) {
        orderService.confirmDelivery(orderId);
        return ResponseEntity.ok(new ApiResponse<>("Delivery confirmed successfully", null));
    }
    
    // ==================== Review Management ====================
    
    @PostMapping("/{orderId}/review")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<String>> submitReview(
            @PathVariable Long orderId,
            @RequestBody SubmitReviewRequest request
    ) {
        orderService.submitReview(orderId, request);
        return ResponseEntity.status(201).body(new ApiResponse<>("Review submitted successfully", null));
    }
    
    @GetMapping("/{orderId}/reviews")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<java.util.List<OrderReviewResponse>>> getOrderReviews(@PathVariable Long orderId) {
        java.util.List<OrderReviewResponse> reviews = orderService.getOrderReviews(orderId);
        return ResponseEntity.ok(new ApiResponse<>("Reviews retrieved successfully", reviews));
    }
    
    // ==================== Order Cancellation ====================
    
    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<String>> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody CancelOrderRequest request
    ) {
        orderService.cancelOrder(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>("Order cancelled successfully", null));
    }
    
    // ==================== Order Status Update ====================
    
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('BIDDER', 'SELLER')")
    public ResponseEntity<ApiResponse<String>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        orderService.updateOrderStatus(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>("Order status updated successfully", null));
    }
}
