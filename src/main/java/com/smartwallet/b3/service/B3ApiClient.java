package com.smartwallet.b3.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwallet.b3.config.B3ApiProperties;
import com.smartwallet.b3.dto.B3Dtos.B3ProxyRequest;
import com.smartwallet.b3.dto.B3Dtos.B3ProxyResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Component
public class B3ApiClient {

    private final B3ApiProperties properties;
    private final ObjectMapper objectMapper;

    public B3ApiClient(B3ApiProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public B3ProxyResponse execute(B3ProxyRequest request) {
        ensureEnabled();

        try {
            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(properties.getConnectTimeoutMs()))
                .build();

            HttpRequest.Builder builder = HttpRequest.newBuilder(buildUri(request.path(), request.queryParams()))
                .timeout(Duration.ofMillis(properties.getReadTimeoutMs()))
                .header("Accept", "application/json");

            bearerToken().ifPresent(token -> builder.header("Authorization", "Bearer " + token));

            String method = Optional.ofNullable(request.method()).orElse("GET").trim().toUpperCase();
            if ("GET".equals(method) || "DELETE".equals(method)) {
                builder.method(method, HttpRequest.BodyPublishers.noBody());
            } else {
                builder.header("Content-Type", "application/json");
                builder.method(method, HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(request.body())));
            }

            HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            Object body = response.body() == null || response.body().isBlank()
                ? null
                : objectMapper.readValue(response.body(), Object.class);

            return new B3ProxyResponse(response.statusCode(), body);
        } catch (IOException ex) {
            throw new IllegalStateException("Falha ao processar resposta da API B3", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Chamada para API B3 interrompida", ex);
        }
    }

    private void ensureEnabled() {
        if (!properties.isEnabled()) {
            throw new IllegalStateException("Integracoes B3 estao em modo standby");
        }
        if (!StringUtils.hasText(properties.getBaseUrl())) {
            throw new IllegalStateException("Base URL da B3 nao configurada");
        }
    }

    private URI buildUri(String path, Map<String, String> queryParams) {
        if (!StringUtils.hasText(path) || !path.startsWith("/") || path.contains("://")) {
            throw new IllegalArgumentException("Caminho B3 invalido");
        }

        String baseUrl = properties.getBaseUrl().endsWith("/")
            ? properties.getBaseUrl().substring(0, properties.getBaseUrl().length() - 1)
            : properties.getBaseUrl();

        StringBuilder uri = new StringBuilder(baseUrl).append(path);
        if (queryParams != null && !queryParams.isEmpty()) {
            uri.append('?');
            queryParams.forEach((key, value) -> {
                if (StringUtils.hasText(key) && value != null) {
                    if (uri.charAt(uri.length() - 1) != '?') {
                        uri.append('&');
                    }
                    uri.append(encode(key)).append('=').append(encode(value));
                }
            });
        }

        return URI.create(uri.toString());
    }

    private Optional<String> bearerToken() {
        if (StringUtils.hasText(properties.getAccessToken())) {
            return Optional.of(properties.getAccessToken().trim());
        }
        return Optional.empty();
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
