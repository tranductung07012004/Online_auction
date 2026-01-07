package com.service.main.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper mapper = builder.build();
        
        // Disable scientific notation for BigDecimal (fix error 45,000,000 => 4.5E+7)
        mapper.getFactory().configure(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN, true);
        
        return mapper;
    }
}