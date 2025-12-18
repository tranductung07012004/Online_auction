package com.service.user.service;

public interface KafkaProducerService {
    public void sendMessage(String topic, String eventType, Object payload);

    public void sendMessageWithCallback(String topic, String eventType, Object payload);

    public void sendMessageWithKey(String topic, String key, String eventType, Object payload);
}
