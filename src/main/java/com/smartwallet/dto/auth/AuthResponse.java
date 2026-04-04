package com.smartwallet.dto.auth;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresIn,
    UserInfo user
) {
    public record UserInfo(
        Long id,
        String email,
        String fullName
    ) {}
}