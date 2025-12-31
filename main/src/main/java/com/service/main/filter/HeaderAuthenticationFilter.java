package com.service.main.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest req,
            @NonNull HttpServletResponse res,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        //String requestURI = req.getRequestURI();

//        if (requestURI.startsWith("/api/main/**")) {
//            filterChain.doFilter(req, res);
//            return;
//        }


        String userId = req.getHeader("X-user-id");
        String userRole = req.getHeader("X-user-role");
        if (userId == null || userRole == null) {
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.setContentType("application/json");
            res.getWriter().write("{\"message\":\"Request is not authenticated\",\"error\":\"UNAUTHORIZED\"}");
            return;
        }

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + userRole))
        );

        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));

        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(req, res);
    }
}
