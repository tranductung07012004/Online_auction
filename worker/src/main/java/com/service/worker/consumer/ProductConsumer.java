package com.service.worker.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.service.worker.constants.KafkaEventTypes;
import com.service.worker.constants.KafkaTopics;
import com.service.worker.dto.KafkaMessage;
import com.service.worker.dto.ProductCreatedEvent;
import com.service.worker.dto.ProductCurrentPriceUpdatedEvent;
import com.service.worker.dto.ProductEndAtUpdatedEvent;
import com.service.worker.service.ElasticSearchService;
import com.service.worker.service.ProductService;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class ProductConsumer {

    private static final Logger logger = LoggerFactory.getLogger(ProductConsumer.class);
    private final ObjectMapper objectMapper;
    private final ElasticSearchService elasticSearchService;
    private final ProductService productService;

    @KafkaListener(topics = KafkaTopics.SYNC_PRODUCT_ENTITY_TO_ES, groupId = "worker-service-group")
    public void consumeProductRelatedEvent(
            @Payload KafkaMessage message,
            @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        boolean shouldAck = false;

        try {
            String eventType = message.getEventType();
            logger.info("Received message - Key: {}, Partition: {}, Offset: {}, EventType: {}",
            key, partition, offset, eventType);
            if (KafkaEventTypes.CREATE_PRODUCT.equals(message.getEventType())) {

                ProductCreatedEvent eventData = objectMapper.convertValue(
                        message.getPayload(),
                        ProductCreatedEvent.class);


                this.elasticSearchService.storeProductToElastic(eventData);
                this.productService.updateLastEsSyncCurPriceAt(eventData.getId());

                shouldAck = true;

                logger.info("Successfully processed CREATE_PRODUCT event for productId: {}",
                        eventData.getId()); 
            }
            else if (KafkaEventTypes.UPDATE_PRODUCT_CURRENT_PRICE.equals(message.getEventType())) {
                logger.info("before checking event type");

                logger.warn("before object mapper");

                ProductCurrentPriceUpdatedEvent eventData = objectMapper.convertValue(
                        message.getPayload(),
                        ProductCurrentPriceUpdatedEvent.class);

                logger.warn("before call to elastic search service");

                this.elasticSearchService.updateCurrentPriceToProductInES(eventData);


                shouldAck = true;

                logger.info("Successfully processed current price change event for productId: {}",
                        eventData.getProductId());
            }
            else if (KafkaEventTypes.UPDATE_PRODUCT_END_AT.equals(message.getEventType())) {
                
                logger.info("Received message - Key: {}, Partition: {}, Offset: {}, EventType: {}",
                        key, partition, offset, message.getEventType());

    
                ProductEndAtUpdatedEvent eventData = objectMapper.convertValue(
                        message.getPayload(),
                        ProductEndAtUpdatedEvent.class);
    
                this.elasticSearchService.updateEndAtToProductInEs(eventData);
    
                shouldAck = true;
    
                logger.info("Successfully processed endAt change  event for productId: {}",
                        eventData.getProductId());
            }
        } catch (IllegalArgumentException ex) {
            logger.error("Invalid payload format, skip message", ex);
            shouldAck = true;
        } catch (Exception e) {
            logger.error("Error processing message from topic {}: {}",
                    KafkaTopics.SYNC_PRODUCT_ENTITY_TO_ES, e.getMessage(), e);
            // can implement retry logic hoặc dead letter queue here
            throw e; // for kafka to retry
        } finally {
            if (shouldAck) {
                acknowledgment.acknowledge();
            }
        }
    }
}
