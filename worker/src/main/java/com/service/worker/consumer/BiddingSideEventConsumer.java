package com.service.worker.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.service.worker.constants.KafkaEventTypes;
import com.service.worker.constants.KafkaTopics;
import com.service.worker.dto.BlackListEvent;
import com.service.worker.dto.KafkaMessage;
import com.service.worker.dto.ProductEndedEvent;
import com.service.worker.service.NotifyBiddingService;
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
public class BiddingSideEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(BiddingSideEventConsumer.class);
    private final ObjectMapper objectMapper;
    private final NotifyBiddingService notifyBiddingService;

    @KafkaListener(topics = KafkaTopics.BIDDING_PROCESS_SIDE_EVENT, groupId = "worker-service-group")
    public void consumeBiddingSideEvent(
            @Payload KafkaMessage message,
            @Header(value = KafkaHeaders.RECEIVED_KEY, required = false) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        boolean shouldAck = false;

        try {
            logger.info("Received message - Key: {}, Partition: {}, Offset: {}, EventType: {}",
                    key, partition, offset, message.getEventType());

            String eventType = message.getEventType();

            if (KafkaEventTypes.BLACK_LIST.equals(eventType)) {
                BlackListEvent eventData = objectMapper.convertValue(
                        message.getPayload(),
                        BlackListEvent.class
                );

                logger.info("Processing BLACK_LIST event - ProductId: {}, BidderId: {}, BidderEmail: {}",
                        eventData.getProductId(), eventData.getBidderId(), eventData.getBidderEmail());

                this.notifyBiddingService.notifyBlackList(eventData);

                shouldAck = true;

                logger.info("Successfully processed BLACK_LIST event for productId: {}, bidderId: {}",
                        eventData.getProductId(), eventData.getBidderId());
            } else if (KafkaEventTypes.PRODUCT_ENDED_SECTION.equals(eventType)) {
                ProductEndedEvent eventData = objectMapper.convertValue(
                        message.getPayload(),
                        ProductEndedEvent.class
                );

                logger.info("Processing PRODUCT_ENDED_SECTION event - SellerId: {}, TopBidderId: {}, CurrentPrice: {}",
                        eventData.getSellerId(), eventData.getTopBidderId(), eventData.getCurrentPrice());

                this.notifyBiddingService.notifyProductEnded(eventData);

                shouldAck = true;

                logger.info("Successfully processed PRODUCT_ENDED_SECTION event for sellerId: {}, topBidderId: {}",
                        eventData.getSellerId(), eventData.getTopBidderId());
            } else {
                // Unknown event type, acknowledge to skip
                logger.debug("Unknown event type: {}, skipping", eventType);
                shouldAck = true;
            }

        } catch (IllegalArgumentException ex) {
            logger.error("Invalid payload format, skip message", ex);
            shouldAck = true;
        } catch (Exception e) {
            logger.error("Error processing message from topic {}: {}",
                    KafkaTopics.BIDDING_PROCESS_SIDE_EVENT, e.getMessage(), e);
            // can implement retry logic hoặc dead letter queue here
            throw e; // for kafka to retry
        } finally {
            if (shouldAck) {
                acknowledgment.acknowledge();
            }
        }
    }
}
