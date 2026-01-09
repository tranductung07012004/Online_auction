package com.service.main.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Clients subscribe to receive messages: /topic/chat/{orderId}
        config.enableSimpleBroker("/topic");
        
        // Clients send messages to: /app/chat/send
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint: ws://localhost:8080/ws-chat
        registry.addEndpoint("/ws-chat")
            .setAllowedOriginPatterns("*"); // Allow all origins (adjust for production)
                // .withSockJS(); // Enable SockJS fallback
    }
}
