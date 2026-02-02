package com.service.integration.autoconfigure;

import com.service.integration.userclient.UserServiceClient;
import com.service.integration.userclient.impl.UserServiceClientImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@ConditionalOnClass(RestTemplate.class)
public class UserclientAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public UserServiceClient initUserServiceClient() {
        return new UserServiceClientImpl();
    }
}
