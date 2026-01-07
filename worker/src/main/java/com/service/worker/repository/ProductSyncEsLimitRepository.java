package com.service.worker.repository;


import com.service.worker.entity.ProductSyncEsLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductSyncEsLimitRepository extends JpaRepository<ProductSyncEsLimit, Long> {
    @Query("SELECT p from ProductSyncEsLimit p where p.productId = :productId")
    Optional<ProductSyncEsLimit> findByProductId(@Param("productId") Long productId);

    /**
     * Find products that need to be synced to Elasticsearch.
     * Uses FOR UPDATE SKIP LOCKED to prevent deadlocks when multiple workers run concurrently.
     */
    @Query(value = """
        SELECT product_id 
        FROM product_sync_es_limit
        WHERE last_cur_price_change_at IS NOT NULL 
          AND (last_es_sync_cur_price_at IS NULL 
               OR last_cur_price_change_at > last_es_sync_cur_price_at)
        ORDER BY last_cur_price_change_at ASC
        LIMIT :limit
        FOR UPDATE SKIP LOCKED
        """, nativeQuery = true)
    List<Long> findProductsToSync(@Param("limit") int limit);

    /**
     * Bulk update last_es_sync_cur_price_at for multiple products.
     */
    @Modifying // update, delete, create needs modifying annotation
    @Query(value = """
        UPDATE product_sync_es_limit
        SET last_es_sync_cur_price_at = :syncTime
        WHERE product_id IN :productIds
        """, nativeQuery = true)
    int updateLastEsSyncCurPriceAt(
        @Param("productIds") List<Long> productIds,
        @Param("syncTime") OffsetDateTime syncTime
    );
}
