package com.smartwallet.config.security;

import com.smartwallet.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();
        
        log.debug("JWT Filter: {} {}", method, path);

        if ("OPTIONS".equalsIgnoreCase(method) || 
            path.startsWith("/api/auth/") || 
            path.contains("/actuator/")) {
            
            log.debug("JWT Filter: Skipping public route");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = extractJwtFromRequest(request);
            log.debug("JWT extracted: {}", jwt != null ? "present" : "null");

            if (StringUtils.hasText(jwt) && jwtUtils.validateToken(jwt)) {
                String email = jwtUtils.getEmailFromToken(jwt);
                log.debug("Token valid for email: {}", email);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                log.debug("UserDetails loaded: {}", userDetails.getUsername());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("User authenticated: {}", email);
            } else {
                log.debug("No valid JWT token - request will be rejected by Spring Security");
            }
        } catch (Exception e) {
            log.error("JWT Filter ERROR: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

        try {
            String jwt = extractJwtFromRequest(request);
            System.out.println(">>> JWT extracted: " + (jwt != null ? "present" : "null"));

            if (StringUtils.hasText(jwt) && jwtUtils.validateToken(jwt)) {
                String email = jwtUtils.getEmailFromToken(jwt);
                System.out.println(">>> Token valid for email: " + email);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                System.out.println(">>> UserDetails loaded: " + userDetails.getUsername());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println(">>> User authenticated: " + email);
            } else {
                System.out.println(">>> No valid JWT token - request will be rejected by Spring Security");
            }
        } catch (Exception e) {
            System.out.println(">>> JWT Filter ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}