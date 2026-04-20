package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.auth.*;
import com.smartwallet.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.debug("Register request received");
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Usuário registrado com sucesso", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.debug("Login request received");
        AuthResponse response = authService.login(request);
        log.debug("Login successful");
        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Email de recuperação enviado", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Senha redefinida com sucesso", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails userDetails,
            org.springframework.security.core.Authentication authentication) {

        if (userDetails != null && authentication != null) {
            Long userId = getUserIdFromAuthentication(authentication);
            if (userId != null) {
                authService.logout(userId);
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Logout realizado com sucesso", null));
    }

    private Long getUserIdFromAuthentication(org.springframework.security.core.Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.smartwallet.security.CustomUserDetails) {
            return ((com.smartwallet.security.CustomUserDetails) principal).getId();
        }
        return null;
    }
}