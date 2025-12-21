package com.service.user.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.service.user.exception.ApplicationException;
import com.service.user.constants.ErrorCodes;
import com.service.user.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class LoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestId = UUID.randomUUID().toString();
        long startTime = System.currentTimeMillis();
        String userId = this.extractUserId(request);

        // Set MDC for logging context
        MDC.put("requestId", requestId);
        MDC.put("method", request.getMethod());
        MDC.put("endpoint", request.getRequestURI());
        MDC.put("userId", userId);
        MDC.put("userAgent", request.getHeader("User-Agent"));
        MDC.put("remoteAddr", request.getRemoteAddr());

        // Store start time in request attribute
        request.setAttribute("startTime", startTime);
        request.setAttribute("requestId", requestId);

        logger.info("Request started: {} {}", request.getMethod(), request.getRequestURI());

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;

        // Set response time in MDC
        MDC.put("responseTime", String.valueOf(responseTime));
        MDC.put("statusCode", String.valueOf(response.getStatus()));

        if (ex != null) {
            logger.error("Request failed: {} {} - Status: {} - Time: {}ms - Error: {}",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), responseTime, ex.getMessage());
        } else {
            logger.info("Request completed: {} {} - Status: {} - Time: {}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), responseTime);
        }

        // Clear MDC
        MDC.clear();
    }

    private String extractUserId(HttpServletRequest request) {
        try {
            // Get Authorization header
            String authHeader = request.getHeader("Authorization");

            // Check if Bearer token exists
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // Remove "Bearer " prefix

                // Validate and extract userId using JwtUtil
                if (jwtUtil.validateToken(token)) {
                    return jwtUtil.extractUserId(token);
                }
            }
        } catch (Exception e) {
            throw new ApplicationException(ErrorCodes.TOKEN_INVALID_INTERCEPTOR, "Token is not valid at LoggingInterceptor");
        }

        return "anonymous";
    }
}
