package com.service.main.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "order_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "amount", nullable = false, precision = 15, scale = 5)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // BANK_TRANSFER, PAYPAL, CREDIT_CARD, COD

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus; // PENDING, PROOF_UPLOADED, CONFIRMED, FAILED, REFUNDED

    @Column(name = "payment_proof_url", columnDefinition = "TEXT")
    private String paymentProofUrl;

    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Column(name = "buyer_paid_at")
    private OffsetDateTime buyerPaidAt;

    @Column(name = "seller_confirmed_at")
    private OffsetDateTime sellerConfirmedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (paymentStatus == null) {
            paymentStatus = "PENDING";
        }
        if (paymentMethod == null) {
            paymentMethod = "BANK_TRANSFER";
        }
    }
}
