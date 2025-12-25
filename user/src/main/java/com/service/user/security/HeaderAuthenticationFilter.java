package com.service.user.security;

import com.service.user.exception.ApplicationException;
import com.service.user.constants.ErrorCodes;
import com.service.user.constants.ErrorMessages;
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

import java.util.List;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class HeaderAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    // @Override
    // protected void doFilterInternal(HttpServletRequest req,
    //                                 @NonNull HttpServletResponse res,
    //                                 @NonNull FilterChain filterChain) throws ServletException, IOException {
    //     String authHeader = req.getHeader("Authorization");
    //     System.out.println(11);

    //     String requestURI = req.getRequestURI();
    //     if (requestURI.startsWith("/api/user/auth/login") ||
    //             requestURI.startsWith("/api/user/auth/register") ||
    //             requestURI.startsWith("/api/user/auth/refresh")) {
    //         System.out.println(15);
    //         filterChain.doFilter(req, res);
    //         return;
    //     }
    //     System.out.println(16);
    //     if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    //         System.out.println(13);
    //         throw new ApplicationException(ApplicationException.INVALID_TOKEN);
    //     }

    //     String token = authHeader.substring(7);

    //     if (!jwtUtil.validateToken(token)) {
    //         throw new ApplicationException(ApplicationException.UNAUTHORIZED);
    //     }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   

    //     String userId = jwtUtil.extractUserId(token);
    //     String role = jwtUtil.extractUserRole(token);


    //     UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
    //             userId,
    //             null,
    //             List.of(new SimpleGrantedAuthority("ROLE_" + role))
    //     );
    //     auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
    //     SecurityContextHolder.getContext().setAuthentication(auth);

    //     System.out.println("DEBUG - Authentication authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());

    //     filterChain.doFilter(req, res);
    // }


    // Lam the nay thi co kha nang bi goi thang, bypass gateway, cach o tren thi zero-trust hon
    // Nhung cach nay de hon, va lam sao de cac service ko expose api ra ngoai, chi dung mang noi bo
    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                @NonNull HttpServletResponse res,
                                @NonNull FilterChain filterChain) throws ServletException, IOException {
        String requestURI = req.getRequestURI();
        if (requestURI.startsWith("/api/user/auth/login") ||
            requestURI.startsWith("/api/user/auth/register") ||
            requestURI.startsWith("/api/user/auth/refresh") ||
            requestURI.startsWith("/api/user/auth/logout") ||
            requestURI.startsWith("/api/user/auth/verify-otp")) {
            filterChain.doFilter(req, res);
            return;
        }

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
