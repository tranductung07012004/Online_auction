package com.service.integration.autoconfigure;

import com.service.integration.messaging.KafkaProducerService;
import com.service.integration.messaging.impl.KafkaProducerServiceImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;

@Configuration
@ConditionalOnClass(KafkaTemplate.class)
public class MessagingAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public KafkaProducerService initKafkaProducerService(KafkaTemplate<String, Object> kTemplate) {
        return new KafkaProducerServiceImpl(kTemplate);
    }
}
