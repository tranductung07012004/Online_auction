package com.service.worker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Data
@Table(name = "product")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false)
    private String productName;


    @Column(columnDefinition = "TEXT", nullable = false)
    private String thumbnailUrl;

    @DecimalMin(value = "0.0", inclusive = false) // giá > 0
    @Column(name = "start_price", nullable = false, precision = 15, scale = 5)
    private BigDecimal startPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name ="current_price", precision = 15, scale = 5)
    private BigDecimal currentPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "buy_now_price", precision = 15, scale = 5)
    private BigDecimal buyNowPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "minimum_bid_step", nullable = false, precision = 15, scale = 5)
    private BigDecimal minimumBidStep;

    @Column(name = "top_bidder_id")
    private Long topBidderId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "auto_extend_enabled", nullable = false)
    private Boolean autoExtendEnabled;

    @Min(0)
    @Column(name = "bid_count", nullable = false)
    private Integer bidCount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt;

    @Column(name = "last_cur_price_change_at")
    private OffsetDateTime lastCurrentPriceChangeAt;

    @Column(name = "last_es_sync_cur_price_at")
    private OffsetDateTime lastEsSyncCurrentPriceAt;
}
