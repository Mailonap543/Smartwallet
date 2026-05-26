package com.smartwallet.bank.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
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
        @JsonProperty("primary_color") String primaryColor,
        @JsonProperty("category") String category,
        @JsonProperty("country") String country,
        @JsonProperty("payment_enabled") boolean paymentEnabled,
        @JsonProperty("investment_enabled") boolean investmentEnabled
    ) {}

    public static record PaymentRequest(
        @JsonProperty("institution_id") @JsonAlias("institutionId") String institutionId,
        @JsonProperty("amount") BigDecimal amount,
        @JsonProperty("currency") String currency,
        @JsonProperty("method") String method,
        @JsonProperty("pix_key") @JsonAlias("pixKey") String pixKey,
        @JsonProperty("beneficiary_name") @JsonAlias("beneficiaryName") String beneficiaryName,
        @JsonProperty("description") String description,
        @JsonProperty("reference_type") @JsonAlias("referenceType") String referenceType,
        @JsonProperty("reference_id") @JsonAlias("referenceId") String referenceId
    ) {}

    public static record PaymentResponse(
        @JsonProperty("payment_id") String paymentId,
        @JsonProperty("status") String status,
        @JsonProperty("institution_id") String institutionId,
        @JsonProperty("institution_name") String institutionName,
        @JsonProperty("amount") BigDecimal amount,
        @JsonProperty("currency") String currency,
        @JsonProperty("method") String method,
        @JsonProperty("checkout_url") String checkoutUrl,
        @JsonProperty("pix_copy_paste") String pixCopyPaste,
        @JsonProperty("message") String message,
        @JsonProperty("created_at") LocalDateTime createdAt
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
