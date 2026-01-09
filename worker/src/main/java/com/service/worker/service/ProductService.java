package com.service.worker.service;

import com.service.worker.entity.ProductSyncEsLimit;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface ProductService {

    Optional<ProductSyncEsLimit> findProductEsSyncLimit(Long productId);


    default void updateLastEsSyncCurPriceAt(Long productId) {
        updateLastEsSyncCurPriceAt(productId, OffsetDateTime.now());
    }


    void updateLastEsSyncCurPriceAt(Long productId, OffsetDateTime syncTime);

    void syncProductsToElasticsearch(int batchSize);
    
}
