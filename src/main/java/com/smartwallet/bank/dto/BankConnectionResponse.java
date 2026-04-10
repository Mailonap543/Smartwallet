package com.smartwallet.bank.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public record BankConnectionResponse(
    @JsonProperty("link") String link,
    @JsonProperty("session_id") String sessionId,
    @JsonProperty("expires_at") LocalDateTime expiresAt
) {}