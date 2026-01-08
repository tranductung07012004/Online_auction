package com.service.worker.scheduler;

import com.service.worker.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProductSyncScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ProductSyncScheduler.class);
    private final ProductService productService;

    private static final int BATCH_SIZE = 500;

    /**
     * Scheduled job that runs every X miliseconds to sync products to Elasticsearch.
     * This job finds products that have price changes and updates their sync timestamp.
     */
    @Scheduled(fixedRate = 1 * 60 * 1000) 
    public void syncProductsToElasticsearch() {
        logger.info("Starting scheduled product sync to Elasticsearch...");
        
        try {
            this.productService.syncProductsToElasticsearch(BATCH_SIZE);
            logger.info("Scheduled product sync to Elasticsearch completed successfully");
        } catch (Exception e) {
            logger.error("Error in scheduled product sync to Elasticsearch", e);
            // Nen implement retry logic, notification, metrics, etc
        }
    }
}

