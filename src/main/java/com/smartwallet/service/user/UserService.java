package com.smartwallet.service.user;

import com.smartwallet.dto.user.*;
import com.smartwallet.entity.User;
import com.smartwallet.exception.BusinessException;
import com.smartwallet.exception.ResourceNotFoundException;
import com.smartwallet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (request.email() != null && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new BusinessException("Email já está em uso", "EMAIL_ALREADY_EXISTS");
            }
            user.setEmail(request.email());
        }

        if (request.cpf() != null && !request.cpf().equals(user.getCpf())) {
            if (user.getCpf() != null && userRepository.findByCpf(request.cpf()).isPresent()) {
                throw new BusinessException("CPF já está em uso", "CPF_ALREADY_EXISTS");
            }
            user.setCpf(request.cpf());
        }

        user.setFullName(request.fullName());
        user.setPhone(request.phone());

        user = userRepository.save(user);
        logger.info("Profile updated for user: {}", user.getEmail());

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Senha atual incorreta", "INVALID_CURRENT_PASSWORD");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        logger.info("Password changed for user: {}", user.getEmail());
    }

    @Transactional
    public String uploadProfileImage(Long userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Arquivo vazio", "EMPTY_FILE");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Tipo de arquivo inválido", "INVALID_FILE_TYPE");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        try {
            String uploadDir = "uploads/profile-images";
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
            
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = path.resolve(newFilename);
            Files.write(filePath, file.getBytes());

            String imageUrl = "/uploads/profile-images/" + newFilename;
            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);

            logger.info("Profile image uploaded for user: {}", user.getEmail());
            return imageUrl;

        } catch (IOException e) {
            logger.error("Error uploading profile image", e);
            throw new BusinessException("Erro ao上传ar imagem", "UPLOAD_ERROR");
        }
    }

    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        user.setIsActive(false);
        userRepository.save(user);
        
        logger.info("User deactivated: {}", user.getEmail());
    }

    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        user.setIsActive(true);
        userRepository.save(user);
        
        logger.info("User activated: {}", user.getEmail());
    }
}