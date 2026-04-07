package com.smartwallet.config

import com.smartwallet.security.HeaderAuthFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
class SecurityConfig(
    private val headerAuthFilter: HeaderAuthFilter
) {
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http.csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers(
                    "/api/market/**",
                    "/api/v1/market/**",
                    "/actuator/**"
                ).permitAll()
                    .requestMatchers("/api/**", "/api/v1/**").authenticated()
                    .anyRequest().permitAll()
            }
            .addFilterBefore(headerAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
        return http.build()
    }
}
