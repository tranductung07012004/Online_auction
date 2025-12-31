package com.api.gateway.filter;

import com.api.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements GlobalFilter {

    private final JwtUtil jwtUtil;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getPath().toString();


        if (path.startsWith("/api/user/auth/login")
                || path.startsWith("/api/user/auth/register")
                || path.startsWith("/api/user/auth/logout")
                || path.startsWith("/api/user/auth/refresh")
                || path.startsWith("/api/user/auth/verify-otp")
        ) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return setUnauthorizedResponse(exchange, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        
        // Validate token
        if (!jwtUtil.isTokenValid(token)) {
            return setUnauthorizedResponse(exchange, "Invalid or expired token");
        }

        String userId = jwtUtil.getUserIdFromToken(token);
        String userRole = jwtUtil.getRoleFromToken(token);

        // Tai sao lai gan userId vao trong header nhi ??
        ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
            .header("X-user-id", userId)
            .header("X-user-role", userRole)
            .build();

        ServerWebExchange modifiedExchange = exchange.mutate()
            .request(modifiedRequest)
            .build();
        return chain.filter(modifiedExchange);
    }

    private Mono<Void> setUnauthorizedResponse(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        var errorResponse = Map.ofEntries(
                Map.entry("message", message),
                Map.entry("errorCode", "UNAUTHORIZED_EXPIRED_INVALID_TOKEN"),
                Map.entry("timestamp", System.currentTimeMillis()),
                Map.entry("path", exchange.getRequest().getPath().toString())
        );

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
            return exchange.getResponse().writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            return exchange.getResponse().setComplete();
        }
    }
}
