package com.smartwallet.bank.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ContÃªiner para DTOs bancÃ¡rios, evitando mÃºltiplas classes pÃºblicas por arquivo.
 */
public class BankDtos {

    public static record BankConnectionRequest(
        @JsonProperty("institution_id") String institutionId,
        @JsonProperty("callback_url") String callbackUrl
    ) {}

    public static record BankConnectionResponse(
        @JsonProperty("link") String link,
        @JsonProperty("session_id") String sessionId,
        @JsonProperty("expires_at") LocalDateTime expiresAt
    ) {}

    public static record Institution(
        @JsonProperty("id") String id,
        @JsonProperty("name") String name,
        @JsonProperty("logo") String logo,
        @JsonProperty("primary_color") String primaryColor
    ) {}

    public static record Account(
        @JsonProperty("id") String id,
        @JsonProperty("name") String name,
        @JsonProperty("type") String type,
        @JsonProperty("subtype") String subtype,
        @JsonProperty("balance") BigDecimal balance,
        @JsonProperty("currency") String currency
    ) {}

    public static record Transaction(
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

    public static record Merchant(
        @JsonProperty("name") String name,
        @JsonProperty("logo") String logo
    ) {}

    public static record BankStatement(
        @JsonProperty("account") Account account,
        @JsonProperty("transactions") List<Transaction> transactions,
        @JsonProperty("balance") BigDecimal balance,
        @JsonProperty("fetched_at") LocalDateTime fetchedAt
    ) {}

    public static record LinkedAccount(
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

    public static record WebhookPayload(
        @JsonProperty("event_type") String eventType,
        @JsonProperty("account_id") String accountId,
        @JsonProperty("data") List<Transaction> data,
        @JsonProperty("timestamp") LocalDateTime timestamp
    ) {}

    public static record RefreshTokenRequest(
        @JsonProperty("refresh_token") String refreshToken
    ) {}

    public static record TokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("expires_in") Long expiresIn,
        @JsonProperty("token_type") String tokenType
    ) {}
}
