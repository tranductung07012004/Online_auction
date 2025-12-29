package com.service.main.service.impl;

import com.service.main.dto.ApiResponse;
import com.service.main.dto.UserInfoResponse;
import com.service.main.service.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceClientImpl implements UserServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${user.service.url}")
    private String userServiceUrl;
    
    @Override
    public UserInfoResponse getUserBasicInfo(Long userId) {
        if (userId == null) {
            return null;
        }
        
        try {
            String url = userServiceUrl + "/api/user/internal/" + userId + "/info";
            
            // Get authentication info from SecurityContext
            HttpHeaders headers = createHeadersWithAuth();
            
            HttpEntity<?> entity = new HttpEntity<>(headers);
            
            ResponseEntity<ApiResponse<UserInfoResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                    new ParameterizedTypeReference<>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody().getData();
            }
            
            log.warn("Failed to get user basic info for userId: {}, status: {}", userId, response.getStatusCode());
            return null;
        } catch (RestClientException e) {
            log.error("Error calling user service for userId: {}", userId, e);
            return null;
        }
    }
    
    private HttpHeaders createHeadersWithAuth() {
        HttpHeaders headers = new HttpHeaders();
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() != null) {
            // Get userId from principal
            String userId = authentication.getPrincipal().toString();
            headers.set("X-user-id", userId);
            
            // Get userRole from authorities (remove "ROLE_" prefix)
            String userRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(authority -> authority.startsWith("ROLE_"))
                    .map(authority -> authority.substring(5)) // Remove "ROLE_" prefix
                    .findFirst()
                    .orElse(null);
            
            if (userRole != null) {
                headers.set("X-user-role", userRole);
            } else {
                log.warn("No role found in authentication authorities");
            }
        } else {
            log.warn("No authentication found in SecurityContext");
        }
        
        return headers;
    }

    @Override
    public com.service.main.dto.UserInfo getUserInfoById(Long userId) {
        UserInfoResponse response = getUserBasicInfo(userId);
        if (response == null) {
            return null;
        }
        return com.service.main.dto.UserInfo.builder()
                .id(response.getId())
                .fullname(response.getFullname())
                .avatar(response.getAvatar())
                .email(null) // UserInfoResponse doesn't have email, need to add if needed
                .build();
    }
}

