package com.service.worker.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.service.worker.constants.KafkaEventTypes;
import com.service.worker.constants.KafkaTopics;
import com.service.worker.dto.KafkaMessage;
import com.service.worker.dto.UserRegisteredEvent;
import com.service.worker.service.OtpService;
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
public class UserRegisteredConsumer {

    private static final Logger logger = LoggerFactory.getLogger(UserRegisteredConsumer.class);
    private final ObjectMapper objectMapper;
    private final OtpService otpService;

    @KafkaListener(topics = KafkaTopics.REGISTER_EVENTS, groupId = "worker-service-group")
    public void consumeUserRegisteredEvent(
            @Payload KafkaMessage message,
            @Header(KafkaHeaders.RECEIVED_KEY) String key,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        boolean shouldAck = false;
        
        try {
            logger.info("Received message - Key: {}, Partition: {}, Offset: {}, EventType: {}", 
                    key, partition, offset, message.getEventType());

            if (!KafkaEventTypes.USER_REGISTERED.equals(message.getEventType())) {
                shouldAck = true;
                return;
            }

            UserRegisteredEvent eventData = objectMapper.convertValue(
                    message.getPayload(),
                    UserRegisteredEvent.class
            );

                logger.info("Processing USER_REGISTERED event - UserId: {}, Email: {}", 
                        eventData.getUserId(), eventData.getEmail());

                processUserRegisteredEvent(eventData);

                shouldAck = true;

                logger.info("Successfully processed USER_REGISTERED event for userId: {}", 
                        eventData.getUserId());

        } catch (IllegalArgumentException ex) {
            logger.error("Invalid payload format, skip message", ex);
            shouldAck = true;
        } catch (Exception e) {
            logger.error("Error processing message from topic {}: {}", 
                    KafkaTopics.REGISTER_EVENTS, e.getMessage(), e);
            // can implement retry logic hoặc dead letter queue here
            throw e; // for kafka to retry 
        } finally {
            if (shouldAck) {
                acknowledgment.acknowledge();
            }
        }
    }

    private void processUserRegisteredEvent(UserRegisteredEvent event) {
        logger.info("Processing user registration for userId: {} with email: {}", 
                event.getUserId(), event.getEmail());
        
        
        otpService.sendVerificationLink(event.getUserId(), event.getEmail(), event.getOtpCode());
    }
}


