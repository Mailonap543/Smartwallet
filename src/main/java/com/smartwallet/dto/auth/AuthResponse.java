package com.smartwallet.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthResponse(
        @JsonProperty("accessToken")
        String accessToken,

        @JsonProperty("refreshToken")
        String refreshToken,

        @JsonProperty("tokenType")
        String tokenType,

        @JsonProperty("expiresIn")
        long expiresIn,

        @JsonProperty("user")
        UserInfo user
) {
    public record UserInfo(
            @JsonProperty("id")
            Long id,

            @JsonProperty("email")
            String email,

            @JsonProperty("fullName")
            String fullName,

            @JsonProperty("role")
            String role
    ) {}
}