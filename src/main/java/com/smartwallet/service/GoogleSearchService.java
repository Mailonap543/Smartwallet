package com.smartwallet.service;

import com.smartwallet.dto.ai.GoogleSearchResponse;
import com.smartwallet.dto.ai.GoogleSearchResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class GoogleSearchService {

    private static final String GOOGLE_SEARCH_URL = "https://www.google.com/search?q=";
    private static final int RESULT_LIMIT = 5;
    private static final String API_KEY_PLACEHOLDER = "sua_chave";
    private static final String SEARCH_ENGINE_ID_PLACEHOLDER = "seu_cx";

    private final RestClient restClient;

    @Value("${smartwallet.google-search.enabled:false}")
    private boolean enabled;

    @Value("${smartwallet.google-search.api-key:}")
    private String apiKey;

    @Value("${smartwallet.google-search.search-engine-id:}")
    private String searchEngineId;

    public GoogleSearchService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("https://customsearch.googleapis.com").build();
    }

    public GoogleSearchResponse searchStocks(String query) {
        String normalizedQuery = normalizeQuery(query);
        String searchQuery = buildStockQuery(normalizedQuery);
        String googleUrl = buildGoogleUrl(searchQuery);

        if (!canUseCustomSearch()) {
            return new GoogleSearchResponse(
                    normalizedQuery,
                    false,
                    "Busca Google pronta. Configure SMARTWALLET_GOOGLE_SEARCH_API_KEY e SMARTWALLET_GOOGLE_SEARCH_ENGINE_ID para ativar resultados dentro da IA.",
                    googleUrl,
                    List.of()
            );
        }

        try {
            Map<String, Object> response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/customsearch/v1")
                            .queryParam("key", apiKey)
                            .queryParam("cx", searchEngineId)
                            .queryParam("q", searchQuery)
                            .queryParam("num", RESULT_LIMIT)
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            List<GoogleSearchResult> results = extractResults(response);
            return new GoogleSearchResponse(normalizedQuery, true, "Pesquisa concluida", googleUrl, results);
        } catch (RuntimeException ex) {
            return new GoogleSearchResponse(
                    normalizedQuery,
                    false,
                    "Nao foi possivel consultar o Google agora. Use o link de fallback ou confira as credenciais.",
                    googleUrl,
                    List.of()
            );
        }
    }

    private boolean canUseCustomSearch() {
        return enabled
                && isConfiguredValue(apiKey, API_KEY_PLACEHOLDER)
                && isConfiguredValue(searchEngineId, SEARCH_ENGINE_ID_PLACEHOLDER);
    }

    private String normalizeQuery(String query) {
        if (!hasText(query)) {
            return "acoes brasileiras";
        }

        return query.trim();
    }

    private String buildStockQuery(String query) {
        return query + " acoes bolsa valores fundamentos cotacao dividendos";
    }

    private String buildGoogleUrl(String searchQuery) {
        return GOOGLE_SEARCH_URL + URLEncoder.encode(searchQuery, StandardCharsets.UTF_8);
    }

    private List<GoogleSearchResult> extractResults(Map<String, Object> response) {
        if (response == null || !(response.get("items") instanceof List<?> items)) {
            return List.of();
        }

        return items.stream()
                .filter(Map.class::isInstance)
                .map(item -> toSearchResult((Map<?, ?>) item))
                .filter(result -> hasText(result.title()) && hasText(result.link()))
                .toList();
    }

    private GoogleSearchResult toSearchResult(Map<?, ?> item) {
        return new GoogleSearchResult(
                stringValue(item.get("title")),
                stringValue(item.get("link")),
                stringValue(item.get("snippet")),
                stringValue(item.get("displayLink"))
        );
    }

    private String stringValue(Object value) {
        return value instanceof String text ? text : "";
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private boolean isConfiguredValue(String value, String placeholder) {
        return hasText(value) && !placeholder.equalsIgnoreCase(value.trim());
    }
}
