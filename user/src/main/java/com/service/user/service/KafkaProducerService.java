package com.service.user.service;

public interface KafkaProducerService {
    void sendMessage(String topic, String eventType, Object payload);

    void sendMessageWithCallback(String topic, String eventType, Object payload);

    void sendMessageWithKey(String topic, String key, String eventType, Object payload);
}
