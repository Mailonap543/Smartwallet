package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.dto.auth.*;
import com.smartwallet.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("🔐 [Register] Recebido: {}", request.email());
        AuthResponse response = authService.register(request);
        log.info("✅ [Register] Sucesso: {}", request.email());
        return ResponseEntity.ok(ApiResponse.success("Usuário registrado com sucesso", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("🔐 [Login] Tentativa para: {}", request.email());
        AuthResponse response = authService.login(request);
        log.info("✅ [Login] Sucesso: {}", request.email());
        return ResponseEntity.ok(ApiResponse.success("Login realizado com sucesso", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("🔄 [Refresh] Iniciando...");
        try {
            AuthResponse response = authService.refreshToken(request);
            log.info("✅ [Refresh] Sucesso");
            return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
        } catch (Exception e) {
            log.error(" [Refresh] Erro: {}", e.getMessage());
            return ResponseEntity.status(401).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("📧 [ForgotPassword] Solicitação para: {}", request.email());
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Email de recuperação enviado", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("🔑 [ResetPassword] Iniciando...");
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Senha redefinida com sucesso", null));
    }
}