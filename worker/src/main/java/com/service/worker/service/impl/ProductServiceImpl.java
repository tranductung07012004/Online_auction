package com.service.worker.service.impl;

import com.service.worker.config.TransactionTemplateProvider;
import com.service.worker.entity.ProductSyncEsLimit;
import com.service.worker.repository.ProductSyncEsLimitRepository;
import com.service.worker.service.ElasticSearchService;
import com.service.worker.service.ProductService;
import com.service.worker.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);
    private final ProductSyncEsLimitRepository productSyncEsLimitRepository;
    private final TransactionTemplateProvider transactionTemplateProvider;
    private final ElasticSearchService elasticSearchService;
    private final ProductRepository productRepository;

    @Override
    public Optional<ProductSyncEsLimit> findProductEsSyncLimit(Long productId) {
        try {
            Optional<ProductSyncEsLimit> result = this.productSyncEsLimitRepository.findByProductId(productId);
            logger.info("Found ProductSyncEsLimit for productId: {}", productId);
            return result;
        } catch (Exception e) {
            logger.error("Failed to find ProductSyncEsLimit for productId: {}", productId, e);
            throw new RuntimeException("Failed to find ProductSyncEsLimit for product " + productId, e);
        }
    }

    @Override
    public void updateLastEsSyncCurPriceAt(Long productId, OffsetDateTime syncTime) {
        try {
            ProductSyncEsLimit productLimit = this.productSyncEsLimitRepository.findByProductId(productId)
                    .orElseThrow(
                            () -> new RuntimeException("ProductSyncEsLimit not found with productId: " + productId));

            productLimit.setLastEsSyncCurPriceAt(syncTime);
            this.productSyncEsLimitRepository.save(productLimit);

            logger.info("Updated lastEsSyncCurPriceAt for productId: {} with time: {}", productId, syncTime);
        } catch (Exception e) {
            logger.error("Failed to update lastEsSyncCurPriceAt for productId: {}", productId, e);
            throw new RuntimeException("Failed to update lastEsSyncCurPriceAt for product " + productId, e);
        }
    }

    @Override
    public void syncProductsToElasticsearch(int batchSize) {
        try {
            logger.info("Starting product sync to Elasticsearch with batch size: {}", batchSize);

            List<Long> productIds = productSyncEsLimitRepository.findProductsToSync(batchSize);

            if (productIds.isEmpty()) {
                logger.warn("No products to sync");
                return;
            }

            logger.info("Found {} products to sync: {}", productIds.size(), productIds);

            OffsetDateTime now = OffsetDateTime.now();

            transactionTemplateProvider.getRequiredReadCommitted().executeWithoutResult(status -> {
                int updatedCount = productSyncEsLimitRepository.updateLastEsSyncCurPriceAt(productIds, now);
                logger.info("Successfully updated {} products with sync timestamp: {}", updatedCount, now);

            });
            
            List<Object[]> res = this.productRepository.findProductCurPriceAndIdByIds(productIds);

            Map<Long, BigDecimal> idPriceMap = res.stream()
                    .collect(Collectors.toMap(
                            row -> (Long) row[0], 
                            row -> (BigDecimal) row[1] 
                    ));

            this.elasticSearchService.bulkUpdateCurrentPriceToEs(idPriceMap);
        } catch (Exception e) {
            logger.error("Error syncing products to Elasticsearch", e);
            throw new RuntimeException("Failed to sync products to Elasticsearch", e);
        }
    }
}
