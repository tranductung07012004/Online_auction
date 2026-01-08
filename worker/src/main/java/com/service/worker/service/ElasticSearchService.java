package com.service.worker.service;

import com.service.worker.dto.ProductCreatedEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndAtUpdatedEvent;

import java.time.OffsetDateTime;
import java.math.BigDecimal;
import java.util.Map;

public interface ElasticSearchService {
    void storeProductToElastic(ProductCreatedEvent product);

    default void updateCurrentPriceToProductInES(ProductCurrentPriceUpdatedEvent eventData) {
        updateCurrentPriceToProductInES(eventData, OffsetDateTime.now());
    }

    void updateCurrentPriceToProductInES(ProductCurrentPriceUpdatedEvent eventData, OffsetDateTime syncTime);

    default void updateEndAtToProductInEs(ProductEndAtUpdatedEvent eventData) {
        updateEndAtToProductInEs(eventData, OffsetDateTime.now());
    }

    void updateEndAtToProductInEs(ProductEndAtUpdatedEvent eventData, OffsetDateTime syncTime);

    void syncCurrentPriceToEs(BigDecimal newCurrentPrice, Long productId);

    void bulkUpdateCurrentPriceToEs(Map<Long, BigDecimal> productPriceMap);
}
