package com.service.user.config;

import com.service.user.constants.KafkaTopics;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaTopicConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic userEventsTopic() {
        return TopicBuilder.name(KafkaTopics.REGISTER_EVENTS)
                .partitions(3)  // Số partitions cho topic
                .replicas(1)    // Số replicas (vì chỉ có 1 broker nên để 1)
                .build();
    }

    // @Bean
    // public NewTopic authorEventsTopic() {
    //     return TopicBuilder.name(KafkaTopics.AUTHOR_EVENTS)
    //             .partitions(3)
    //             .replicas(1)
    //             .build();
    // }
}

