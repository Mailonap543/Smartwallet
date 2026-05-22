package com.smartwallet.security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUserResolver {

    public CustomUserDetails currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new BadCredentialsException("Usuario nao autenticado");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails user) {
            return user;
        }

        throw new BadCredentialsException("Usuario nao autenticado");
    }
}
