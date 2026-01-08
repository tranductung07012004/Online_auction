package com.service.main.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "amount", nullable = false, precision = 15, scale = 5)
    private BigDecimal amount;

    @Column(name = "status", length = 50, nullable = false)
    private String status; // CREATED, CONFIRMED, ADDRESS_PROVIDED, PAYMENT_PROOF_UPLOADED, PAYMENT_CONFIRMED, SHIPPED, DELIVERED, REVIEWED, CANCELLED

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "is_cancelled")
    private Boolean isCancelled;

    @Column(name = "cancelled_reason", columnDefinition = "TEXT")
    private String cancelledReason;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
        if (isCancelled == null) {
            isCancelled = false;
        }
        if (status == null) {
            status = "CREATED";
        }
    }
}
