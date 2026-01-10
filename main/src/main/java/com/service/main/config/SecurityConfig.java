package com.service.main.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.service.main.filter.HeaderAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final HeaderAuthenticationFilter headerFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/ws-chat/**",
                    "/main/api-docs/v3/api-docs/**",
                    "/main/api-docs/swagger-ui/**",
                    "/main/api-docs/swagger-ui.html",
                    "/api/main/categories/search-norm-parent**",
                    "/api/main/categories/search-norm-child**",
                    "/api/main/product/top-ending-soon**",
                    "/api/main/product/most-bid-count**",
                    "/api/main/product/highest-current-price",
                    "/api/main/search**",
                    "/api/main/system-settings/by-key" 
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(headerFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
