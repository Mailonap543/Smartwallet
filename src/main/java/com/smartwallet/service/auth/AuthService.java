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
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        logger.info("🔐 [Login] Tentativa para: {}", request.email());

        User user = userRepository.findByEmail(request.email())
                .orElse(null);

        if (user == null) {
            logger.warn("❌ [Login] Usuário não encontrado: {}", request.email());
            throw new BusinessException("Credenciais inválidas", "INVALID_CREDENTIALS");
        }

        String storedPassword = user.getPasswordHash();
        logger.debug("📝 [Login] Hash length: {}", storedPassword != null ? storedPassword.length() : 0);

        boolean passwordMatches = passwordEncoder.matches(request.password(), storedPassword);
        logger.debug("✓ [Login] Senha match: {}", passwordMatches);

        if (!passwordMatches) {
            logger.warn("❌ [Login] Senha inválida para: {}", request.email());
            throw new BusinessException("Credenciais inválidas", "INVALID_CREDENTIALS");
        }

        logger.info("✅ [Login] Usuário autenticado: {}", user.getEmail());

        // Remove tokens anteriores
        refreshTokenRepository.deleteByUser(user);
        logger.debug("🗑️ [Login] Tokens antigos removidos");

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("📝 [Register] Novo registro: {}", request.email());

        if (userRepository.findByEmail(request.email()).isPresent()) {
            logger.warn("❌ [Register] Email já existe: {}", request.email());
            throw new BusinessException("Email já cadastrado", "EMAIL_ALREADY_EXISTS");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .cpf(request.cpf())
                .phone(request.phone())
                .role("USER")
                .isActive(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        logger.info("✅ [Register] Usuário criado: {}", user.getEmail());

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        logger.info("🔄 [RefreshToken] Iniciando refresh...");
        String refreshToken = request.refreshToken();

        logger.info("🔄 [RefreshToken] Token recebido: {}",
            "entrada processada");

        // Valida o JWT
        boolean isTokenValid = jwtUtils.validateToken(refreshToken);
        logger.info("🔄 [RefreshToken] JWT válido: {}", isTokenValid);

        if (!isTokenValid) {
            logger.warn("❌ [RefreshToken] Token JWT inválido");
            throw new BusinessException("Refresh token inválido", "INVALID_REFRESH_TOKEN");
        }

        
        boolean isRefresh = jwtUtils.isRefreshToken(refreshToken);
        logger.info("🔄 [RefreshToken] É refresh token: {}", isRefresh);

        if (!isRefresh) {
            logger.warn("❌ [RefreshToken] Não é um refresh token");
            throw new BusinessException("Token não é refresh token", "INVALID_TOKEN_TYPE");
        }

        // Busca na base de dados
        logger.info("🔄 [RefreshToken] Buscando token no banco de dados...");
        RefreshToken tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> {
                    logger.warn("❌ [RefreshToken] Token NÃO encontrado no banco!");
                    return new BusinessException("Token não encontrado no banco", "TOKEN_NOT_FOUND");
                });

        logger.info("✅ [RefreshToken] Token encontrado no banco!");

        // Valida expiração
        boolean isValid = tokenEntity.isValid();
        boolean isExpired = tokenEntity.isExpired();
        boolean isRevoked = tokenEntity.getIsRevoked();

        logger.info("🔄 [RefreshToken] isValid: {}, isExpired: {}, isRevoked: {}", isValid, isExpired, isRevoked);

        if (!isValid) {
            logger.warn("❌ [RefreshToken] Token inválido (expirado ou revogado)");
            throw new BusinessException("Token expirado ou revogado", "TOKEN_EXPIRED");
        }

        User user = tokenEntity.getUser();
        logger.info("✅ [RefreshToken] Token válido para: {}", user.getEmail());

        // Remove tokens antigos
        refreshTokenRepository.deleteByUser(user);

        logger.info("✅ [RefreshToken] Novo token gerado para: {}", user.getEmail());
        return generateAuthResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        logger.info("📧 [ForgotPassword] Solicitação para: {}", request.email());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    logger.warn("❌ [ForgotPassword] Email não encontrado: {}", request.email());
                    return new ResourceNotFoundException("Email não encontrado");
                });

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        logger.info("✅ [ForgotPassword] Token reset enviado para: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        logger.info("🔑 [ResetPassword] Solicitação de reset");

        User user = userRepository.findByResetToken(request.token())
                .orElseThrow(() -> {
                    logger.warn("❌ [ResetPassword] Token inválido");
                    return new BusinessException("Token inválido", "INVALID_TOKEN");
                });

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("❌ [ResetPassword] Token expirado");
            throw new BusinessException("Token expirado", "TOKEN_EXPIRED");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        refreshTokenRepository.deleteByUser(user);
        logger.info("✅ [ResetPassword] Senha alterada com sucesso para: {}", user.getEmail());
    }

    private AuthResponse generateAuthResponse(User user) {
        logger.debug("📝 [GenerateAuthResponse] Gerando tokens para: {}", user.getEmail());

        String accessToken = jwtUtils.generateToken(user.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

    logger.debug("   - Access Token gerado");
    logger.debug("   - Refresh Token gerado");

        RefreshToken tokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtUtils.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(tokenEntity);
        logger.debug("✅ [GenerateAuthResponse] Token salvo no banco");

        AuthResponse response = new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtUtils.getJwtExpirationMs(),
                new AuthResponse.UserInfo(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole()
                )
        );

        logger.info("✅ [GenerateAuthResponse] Response gerado com sucesso");
        return response;
    }
}
