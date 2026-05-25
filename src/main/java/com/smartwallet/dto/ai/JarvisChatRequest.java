package com.smartwallet.dto.ai;

public record JarvisChatRequest(
        String message,
        String sessionId,
        Boolean webSearch
) {
}
