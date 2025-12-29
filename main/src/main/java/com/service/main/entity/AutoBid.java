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
@Table(name = "auto_bids")
public class AutoBid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "bidder_id", nullable = false)
    private Long bidderId;

    @Column(name = "max_price", precision = 15, scale = 5, nullable = false)
    private BigDecimal maxPrice;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Không cần relationship OneToMany/ManyToOne vì:
    // - Đây là bảng riêng, chỉ lưu max_price của bidder cho product
    // - Không cần load list auto bids từ Product (chỉ cần query khi cần)
}
