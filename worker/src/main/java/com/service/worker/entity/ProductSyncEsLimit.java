package com.service.worker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "product_sync_es_limit")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSyncEsLimit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "last_cur_price_change_at")
    private OffsetDateTime lastCurPriceChangeAt;

    @Column(name = "last_es_sync_cur_price_at")
    private OffsetDateTime lastEsSyncCurPriceAt;
}

