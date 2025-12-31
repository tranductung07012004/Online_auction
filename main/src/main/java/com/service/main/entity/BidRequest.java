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
@Table(name = "bid_requests")
public class BidRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "bidder_id", nullable = false)
    private Long bidderId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "verified", nullable = false)
    private Boolean verified;


    // Không cần relationship vì:
    // - Chỉ lưu record request, không cần load list từ Product/Bidder/Seller
    // - Nếu cần query, dùng repository method
}
