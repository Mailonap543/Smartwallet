package com.smartwallet.dto.ai;

public record GoogleSearchResult(
        String title,
        String link,
        String snippet,
        String displayLink
) {
}
