package com.smartwallet.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class HeaderAuthFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val userId = request.getHeader("X-User-Id")?.toLongOrNull()
        val path = request.requestURI
        val requiresAuth = path.startsWith("/api/") || path.startsWith("/api/v1/")

        if (userId == null && requiresAuth && !path.startsWith("/api/market") && !path.startsWith("/api/v1/market")) {
            response.status = HttpServletResponse.SC_UNAUTHORIZED
            return
        }

        if (userId != null) {
            val auth = UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                listOf(SimpleGrantedAuthority("USER"))
            )
            SecurityContextHolder.getContext().authentication = auth
        }
        filterChain.doFilter(request, response)
    }
}
