package com.smartwallet.bank.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BankConnectionRequest(
    @JsonProperty("institution_id") String institutionId,
    @JsonProperty("callback_url") String callbackUrl
) {}

public record BankConnectionResponse(
    @JsonProperty("link") String link,
    @JsonProperty("session_id") String sessionId,
    @JsonProperty("expires_at") LocalDateTime expiresAt
) {}

public record Institution(
    @JsonProperty("id") String id,
    @JsonProperty("name") String name,
    @JsonProperty("logo") String logo,
    @JsonProperty("primary_color") String primaryColor
) {}

public record Account(
    @JsonProperty("id") String id,
    @JsonProperty("name") String name,
    @JsonProperty("type") String type,
    @JsonProperty("subtype") String subtype,
    @JsonProperty("balance") BigDecimal balance,
    @JsonProperty("currency") String currency
) {}

public record Transaction(
    @JsonProperty("id") String id,
    @JsonProperty("account_id") String accountId,
    @JsonProperty("amount") BigDecimal amount,
    @JsonProperty("currency") String currency,
    @JsonProperty("date") LocalDateTime date,
    @JsonProperty("description") String description,
    @JsonProperty("merchant") Merchant merchant,
    @JsonProperty("category") String category,
    @JsonProperty("type") String type,
    @JsonProperty("status") String status
) {}

public record Merchant(
    @JsonProperty("name") String name,
    @JsonProperty("logo") String logo
) {}

public record BankStatement(
    @JsonProperty("account") Account account,
    @JsonProperty("transactions") List<Transaction> transactions,
    @JsonProperty("balance") BigDecimal balance,
    @JsonProperty("fetched_at") LocalDateTime fetchedAt
) {}

public record LinkedAccount(
    Long id,
    Long userId,
    String institutionId,
    String institutionName,
    String accountId,
    String accountName,
    String accountType,
    String accessToken,
    String refreshToken,
    LocalDateTime tokenExpiresAt,
    LocalDateTime linkedAt,
    boolean isActive
) {}

public record WebhookPayload(
    @JsonProperty("event_type") String eventType,
    @JsonProperty("account_id") String accountId,
    @JsonProperty("data") List<Transaction> data,
    @JsonProperty("timestamp") LocalDateTime timestamp
) {}

public record RefreshTokenRequest(
    @JsonProperty("refresh_token") String refreshToken
) {}

public record TokenResponse(
    @JsonProperty("access_token") String accessToken,
    @JsonProperty("refresh_token") String refreshToken,
    @JsonProperty("expires_in") Long expiresIn,
    @JsonProperty("token_type") String tokenType
) {}