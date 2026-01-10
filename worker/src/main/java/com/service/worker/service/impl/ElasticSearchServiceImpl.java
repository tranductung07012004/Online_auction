package com.service.worker.service.impl;

import com.service.worker.dto.ProductCreatedEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndAtUpdatedEvent;
import com.service.worker.elasticsearch.document.ProductEsDocument;
import com.service.worker.elasticsearch.repository.ProductEsRepository;
import com.service.worker.entity.ProductSyncEsLimit;
import com.service.worker.repository.ProductSyncEsLimitRepository;
import com.service.worker.service.ElasticSearchService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.document.Document;
import org.springframework.data.elasticsearch.core.mapping.IndexCoordinates;
import org.springframework.data.elasticsearch.core.query.UpdateQuery;
import org.springframework.data.elasticsearch.core.query.UpdateResponse;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class ElasticSearchServiceImpl implements ElasticSearchService {

	private static final Logger logger = LoggerFactory.getLogger(ElasticSearchServiceImpl.class);

	private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

	private final ProductEsRepository productEsRepository;

	private final ElasticsearchOperations elasticsearchOperations;

	private final ProductSyncEsLimitRepository productSyncEsLimitRepository;

	@Override
	public void storeProductToElastic(ProductCreatedEvent product) {
		ProductEsDocument syncProduct = ProductEsDocument.builder()
				.id(product.getId())
				.productName(product.getProduct_name())
				.currentPrice(product.getCurrent_price())
				.endAt(product.getEndAt())
				.categoryIds(product.getCategoryIds())
				.build();
		try {
			this.productEsRepository.save(syncProduct);
			logger.info("Successfully indexed product {} into Elasticsearch", product.getId());
		} catch (Exception e) {
			logger.error("Failed to index product {} into Elasticsearch. Product data: {}",
					product.getId(), product, e);

			// throw exception again for outer service, consumer to catch and process
			// retry/DLQ
			throw new RuntimeException("Elasticsearch indexing failed for product " + product.getId(), e);
		}
	}

	@Override
	public void updateCurrentPriceToProductInES(ProductCurrentPriceUpdatedEvent eventData, OffsetDateTime now) {

		ProductSyncEsLimit productLimit = this.productSyncEsLimitRepository
				.findByProductId(eventData.getProductId())
				.orElseThrow(() -> new RuntimeException("product sync es limit of product id: "
						+ eventData.getProductId() + " not found"));
		if (productLimit.getLastEsSyncCurPriceAt() == null) {
			// sync to es
			this.syncCurrentPriceToEs(eventData.getNewCurrentPrice(), eventData.getProductId());

			// save to db
			productLimit.setLastEsSyncCurPriceAt(now);
			this.productSyncEsLimitRepository.save(productLimit);
		} else {
			Duration timeSinceLastSync = Duration.between(productLimit.getLastEsSyncCurPriceAt(), now);
			if (timeSinceLastSync.toSeconds() >= 20) {
				// sync to es
				this.syncCurrentPriceToEs(eventData.getNewCurrentPrice(), eventData.getProductId());

				// save to db
				productLimit.setLastEsSyncCurPriceAt(now);
				this.productSyncEsLimitRepository.save(productLimit);
			} else {
				logger.info("time sice last sync current price to product in es is: "
						+ timeSinceLastSync + "could not proceed");
			}
		}
	}

	@Override
	public void syncCurrentPriceToEs(BigDecimal newCurrentPrice, Long productId) {
		Map<String, Object> fields = new HashMap<>();
		fields.put("currentPrice", newCurrentPrice);

		UpdateQuery updateQuery = UpdateQuery.builder(productId.toString())
				.withDocument(Document.from(fields))
				.build();
		logger.warn("hahaha123");
		try {
			UpdateResponse response = this.elasticsearchOperations.update(
					updateQuery,
					IndexCoordinates.of("product"));

			logger.warn(String.valueOf(response.getResult()));

			switch (response.getResult()) {
				case UPDATED -> logger.info(
						"Updated current price for productId={}", productId);
				case NOOP -> logger.info(
						"No change for productId={}, current price unchanged", productId);
				case NOT_FOUND -> logger.warn(
						"Product not found in ES, productId={}", productId);
				default -> logger.warn(
						"Unexpected update error with result {} for productId={}",
						response.getResult(), productId);
			}

		} catch (Exception e) {
			logger.error(
					"Failed to update current price in ES for productId={}",
					productId,
					e);
			throw e; // For the outer service to catch and process DLQ/retry
		}
	}

	@Override
	public void updateEndAtToProductInEs(ProductEndAtUpdatedEvent eventData, OffsetDateTime now) {
		Map<String, Object> fields = new HashMap<>();

		fields.put("endAt", eventData.getNewEndAt() != null
				? eventData.getNewEndAt()
						.truncatedTo(ChronoUnit.MILLIS)
						.withOffsetSameInstant(java.time.ZoneOffset.UTC)
						.format(FORMATTER)
				: null);

		UpdateQuery updateQuery = UpdateQuery.builder(eventData.getProductId().toString())
				.withDocument(Document.from(fields))
				.build();

		try {
			UpdateResponse res = this.elasticsearchOperations.update(
					updateQuery,
					IndexCoordinates.of("product"));

			switch (res.getResult()) {
				case UPDATED -> logger.info(
						"Updated endAt for productId={}", eventData.getProductId());
				case NOOP -> logger.info(
						"No change for productId={}, endAt unchanged",
						eventData.getProductId());
				case NOT_FOUND -> logger.warn(
						"Product not found in ES, productId={}", eventData.getProductId());
				default -> logger.warn(
						"Unexpected update error with result {} for productId={}",
						res.getResult(), eventData.getProductId());
			}
		} catch (Exception e) {
			logger.error(
					"Failed to update endAt in ES for productId={}",
					eventData.getProductId());
			throw e; // For the outer service to catch and process DLQ/retry
		}
	}

	@Override
	public void bulkUpdateCurrentPriceToEs(Map<Long, BigDecimal> productPriceMap) {
		List<UpdateQuery> updateQueries = productPriceMap.entrySet().stream()
				.map(entry -> {
					Map<String, Object> fields = new HashMap<>();
					fields.put("currentPrice", entry.getValue());
					return UpdateQuery.builder(entry.getKey().toString())
							.withDocument(Document.from(fields))
							.build();
				})
				.collect(Collectors.toList());

		elasticsearchOperations.bulkUpdate(updateQueries, IndexCoordinates.of("product"));
	}
}
