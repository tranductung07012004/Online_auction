package com.service.user.config;

import com.service.user.security.HeaderAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    private final HeaderAuthenticationFilter headerFilter;

    // ----------This is not best practice, should have add authorization at each endpoint.
    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    //     http.csrf(AbstractHttpConfigurer::disable)
    //             .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    //             .authorizeHttpRequests(auth -> auth
    //                     .requestMatchers("/api/user/auth/login", "/api/user/auth/register", "/api/user/auth/refresh").permitAll()
    //                     // Role-based
    //                     .requestMatchers(HttpMethod.POST, "/api/book/**").hasRole("BIDDER")
    //                     .requestMatchers(HttpMethod.GET, "/api/book/**").hasAnyRole("USER", "ADMIN", "GUEST")
    //                     .requestMatchers(HttpMethod.GET, "/api/author/**").hasAnyRole( "ADMIN", "USER", "GUEST")
    //                     .requestMatchers(HttpMethod.POST, "/api/author/**").hasAnyRole( "ADMIN")

    //                     // All others need login
    //                     .anyRequest().authenticated()
    //             )
    //             .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    //     return http.build();
    // }

    @Bean 
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/user/auth/**").permitAll()
            .anyRequest().authenticated()
            )
            .addFilterBefore(headerFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
