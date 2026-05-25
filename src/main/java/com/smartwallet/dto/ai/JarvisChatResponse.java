package com.smartwallet.dto.ai;

import java.util.List;

public record JarvisChatResponse(
        String reply,
        String sessionId,
        String googleUrl,
        List<GoogleSearchResult> searchResults
) {
}
