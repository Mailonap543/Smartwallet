package com.smartwallet.dto.user;

import com.smartwallet.entity.User;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String email,
    String fullName,
    String phone,
    String cpf,
    String role,
    String profileImageUrl,
    Boolean isActive,
    Boolean emailVerified,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            user.getCpf(),
            user.getRole() != null ? user.getRole().name() : "USER",
            user.getProfileImageUrl(),
            user.getIsActive(),
            user.getEmailVerified(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}