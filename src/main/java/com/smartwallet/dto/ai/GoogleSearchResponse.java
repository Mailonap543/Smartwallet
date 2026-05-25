package com.smartwallet.dto.ai;

import java.util.List;

public record GoogleSearchResponse(
        String query,
        boolean enabled,
        String message,
        String googleUrl,
        List<GoogleSearchResult> results
) {
}
