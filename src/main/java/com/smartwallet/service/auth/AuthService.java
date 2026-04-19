package com.smartwallet.service.auth;

import com.smartwallet.config.security.JwtUtils;
import com.smartwallet.dto.auth.*;
import com.smartwallet.entity.RefreshToken;
import com.smartwallet.entity.User;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.exception.ResourceNotFoundException;
import com.smartwallet.repository.RefreshTokenRepository;
import com.smartwallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email já está em uso", "EMAIL_ALREADY_EXISTS");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .cpf(request.cpf())
                .phone(request.phone())
                .isActive(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        logger.info("New user registered: {}", user.getEmail());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        refreshTokenRepository.revokeAllByUser(user);

        logger.info("User logged in: {}", user.getEmail());
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (!jwtUtils.validateToken(refreshToken) || !jwtUtils.isRefreshToken(refreshToken)) {
            throw new BusinessException("Refresh token inválido", "INVALID_REFRESH_TOKEN");
        }

        RefreshToken tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new BusinessException("Token não encontrado", "TOKEN_NOT_FOUND"));

        if (!tokenEntity.isValid()) {
            throw new BusinessException("Token expirado ou revogado", "TOKEN_EXPIRED");
        }

        User user = tokenEntity.getUser();
        refreshTokenRepository.revokeAllByUser(user);

        logger.info("Token refreshed for user: {}", user.getEmail());
        return generateAuthResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Email não encontrado"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        logger.info("Password reset requested for: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> new BusinessException("Token inválido", "INVALID_TOKEN"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Token expirado", "TOKEN_EXPIRED");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user);
        logger.info("Password reset successful for: {}", user.getEmail());
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtUtils.generateToken(user.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        RefreshToken tokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtils.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(tokenEntity);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtUtils.getJwtExpirationMs(),
                new AuthResponse.UserInfo(user.getId(), user.getEmail(), user.getFullName())
        );
    }
}