package com.service.user.service.impl;

import com.service.user.dto.KafkaMessage;
import com.service.user.service.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class KafkaProducerServiceImpl implements KafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaProducerServiceImpl.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public void sendMessage(String topic, String eventType, Object payload) {
        KafkaMessage message = KafkaMessage.builder()
                .messageId(UUID.randomUUID().toString())
                .eventType(eventType)
                .payload(payload)
                .source("user-service")
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send(topic, message);
        logger.info("Sent message to topic {}: {}", topic, eventType);
    }

    @Override
    public void sendMessageWithCallback(String topic, String eventType, Object payload) {
        KafkaMessage message = KafkaMessage.builder()
                .messageId(UUID.randomUUID().toString())
                .eventType(eventType)
                .payload(payload)
                .source("user-service")
                .timestamp(LocalDateTime.now())
                .build();

        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, message);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Message sent successfully to topic {}: {} with offset {}",
                        topic, eventType, result.getRecordMetadata().offset());
            } else {
                logger.error("Failed to send message to topic {}: {}", topic, eventType, ex);
            }
        });
    }

    @Override
    public void sendMessageWithKey(String topic, String key, String eventType, Object payload) {
        KafkaMessage message = KafkaMessage.builder()
                .messageId(UUID.randomUUID().toString())
                .eventType(eventType)
                .payload(payload)
                .source("user-service")
                .timestamp(LocalDateTime.now())
                .build();

        kafkaTemplate.send(topic, key, message);
        logger.info("Sent message with key {} to topic {}: {}", key, topic, eventType);
    }
}
