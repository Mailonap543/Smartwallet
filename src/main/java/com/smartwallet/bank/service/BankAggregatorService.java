package com.smartwallet.bank.service;

import static com.smartwallet.bank.dto.BankDtos.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class BankAggregatorService {

private static final Logger log = LoggerFactory.getLogger(BankAggregatorService.class);
    private static final String ACCESS_TOKEN_KEY = "access_token";
    private static final List<Institution> SUPPORTED_INSTITUTIONS = List.of(
            new Institution("nubank", "Nubank", null, "#820AD1", "BR_DIGITAL", "Brasil", true, false),
            new Institution("inter", "Inter", null, "#FF7A00", "BR_DIGITAL", "Brasil", true, true),
            new Institution("c6-bank", "C6 Bank", null, "#111827", "BR_DIGITAL", "Brasil", true, true),
            new Institution("picpay", "PicPay", null, "#11C76F", "BR_DIGITAL", "Brasil", true, false),
            new Institution("mercado-pago", "Mercado Pago", null, "#00A8E0", "BR_DIGITAL", "Brasil", true, false),
            new Institution("neon", "Neon", null, "#00AEEF", "BR_DIGITAL", "Brasil", true, false),
            new Institution("pagbank", "PagBank", null, "#FFD600", "BR_DIGITAL", "Brasil", true, false),
            new Institution("banco-pan", "Banco Pan", null, "#00A4FF", "BR_DIGITAL", "Brasil", true, false),
            new Institution("next", "Next", null, "#00D35F", "BR_DIGITAL", "Brasil", true, false),
            new Institution("iti", "iti", null, "#FF6B00", "BR_DIGITAL", "Brasil", true, false),
            new Institution("will-bank", "Will Bank", null, "#FFE100", "BR_DIGITAL", "Brasil", true, false),
            new Institution("sofisa-direto", "Sofisa Direto", null, "#1D4ED8", "BR_DIGITAL", "Brasil", true, true),
            new Institution("btg-pactual", "BTG Pactual", null, "#111827", "BR_DIGITAL", "Brasil", true, true),
            new Institution("banco-original", "Banco Original", null, "#00A86B", "BR_DIGITAL", "Brasil", true, false),
            new Institution("recargapay", "RecargaPay", null, "#6D28D9", "BR_DIGITAL", "Brasil", true, false),
            new Institution("xp", "XP", null, "#111827", "INVESTMENT", "Brasil", true, true),
            new Institution("genial", "Genial Investimentos", null, "#0046AD", "INVESTMENT", "Brasil", true, true),
            new Institution("rico", "Rico", null, "#F97316", "INVESTMENT", "Brasil", true, true),
            new Institution("clear", "Clear", null, "#0EA5E9", "INVESTMENT", "Brasil", true, true),
            new Institution("agora", "Agora Investimentos", null, "#0F766E", "INVESTMENT", "Brasil", true, true),
            new Institution("revolut", "Revolut", null, "#111827", "INTERNATIONAL", "Internacional", true, true),
            new Institution("wise", "Wise", null, "#9FE870", "INTERNATIONAL", "Internacional", true, false),
            new Institution("monzo", "Monzo", null, "#FF4D56", "INTERNATIONAL", "Internacional", true, false),
            new Institution("n26", "N26", null, "#48AC98", "INTERNATIONAL", "Internacional", true, false),
            new Institution("chime", "Chime", null, "#00C389", "INTERNATIONAL", "Internacional", true, false)
    );
    private final WebClient webClient;
    private final String aggregatorApiKey;
    private final String aggregatorBaseUrl;
    private final boolean enabled;

    public BankAggregatorService(
            @Value("${bank.aggregator.api-key:}") String apiKey,
            @Value("${bank.aggregator.base-url:}") String baseUrl,
            @Value("${bank.aggregator.enabled:false}") boolean enabled) {
        
        this.aggregatorApiKey = apiKey;
        this.aggregatorBaseUrl = baseUrl;
        this.enabled = enabled;
        
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public Optional<BankConnectionResponse> createConnectionLink(
            String institutionId, String callbackUrl, String userId) {
        
        if (!enabled) {
            log.warn("Bank aggregator is disabled");
            return Optional.empty();
        }

        try {
            String url = "/v1/link/create";
            Map<String, Object> request = Map.of(
                "institution_id", institutionId,
                "callback_url", callbackUrl,
                "user_id", userId,
                "redirect", true
            );

            BankConnectionResponse response = webClient.post()
                    .uri(url)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BankConnectionResponse.class)
                    .block();

            log.info("Created connection link for institution: {}", institutionId);
            return Optional.of(response);
            
        } catch (WebClientResponseException e) {
            log.error("Failed to create connection link: {} - {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error creating connection link: {}", e.getMessage());
        }

        return Optional.empty();
    }

    public Optional<TokenResponse> exchangeCodeForToken(String code) {
        if (!enabled) return Optional.empty();

        try {
            Map<String, Object> request = Map.of("code", code);
            
            TokenResponse response = webClient.post()
                    .uri("/v1/link/token")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(TokenResponse.class)
                    .block();

            log.info("Exchanged code for access token");
            return Optional.of(response);
            
        } catch (Exception e) {
            log.error("Failed to exchange code for token: {}", e.getMessage());
        }

        return Optional.empty();
    }

    public Optional<BankStatement> getAccountStatement(String accessToken, String accountId, 
            LocalDateTime startDate, LocalDateTime endDate) {
        
        if (!enabled) return Optional.empty();

        try {
            Map<String, Object> params = new HashMap<>();
            params.put(ACCESS_TOKEN_KEY, accessToken);
            params.put("account_id", accountId);
            params.put("date_from", startDate.toLocalDate().toString());
            params.put("date_to", endDate.toLocalDate().toString());

            BankStatement statement = webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/v1/accounts/{accountId}/statements");
                        params.forEach((key, value) -> uriBuilder.queryParam(key, value));
                        return uriBuilder.build(accountId);
                    })
                    .retrieve()
                    .bodyToMono(BankStatement.class)
                    .block();

            log.info("Fetched statement for account: {}", accountId);
            return Optional.of(statement);
            
        } catch (Exception e) {
            log.error("Failed to get account statement: {}", e.getMessage());
        }

        return Optional.empty();
    }

    public List<Transaction> getRecentTransactions(String accessToken, String accountId, 
            int limit) {
        
        if (!enabled) return Collections.emptyList();

        try {
            Map<String, Object> params = Map.of(
                ACCESS_TOKEN_KEY, accessToken,
                "account_id", accountId,
                "limit", limit
            );

            @SuppressWarnings("unchecked")
            List<Transaction> transactions = webClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/v1/accounts/{accountId}/transactions");
                        params.forEach((key, value) -> uriBuilder.queryParam(key, value));
                        return uriBuilder.build(accountId);
                    })
                    .retrieve()
                    .bodyToMono((Class<List<Transaction>>) (Class<?>) List.class)
                    .block();

            return transactions != null ? transactions : Collections.emptyList();
            
        } catch (Exception e) {
            log.error("Failed to get transactions: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    public Optional<TokenResponse> refreshAccessToken(String refreshToken) {
        if (!enabled) return Optional.empty();

        try {
            Map<String, Object> request = Map.of("refresh_token", refreshToken);
            
            TokenResponse response = webClient.post()
                    .uri("/v1/link/refresh")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(TokenResponse.class)
                    .block();

            log.info("Refreshed access token");
            return Optional.of(response);
            
        } catch (Exception e) {
            log.error("Failed to refresh token: {}", e.getMessage());
        }

        return Optional.empty();
    }

    public boolean disconnectAccount(String accessToken) {
        if (!enabled) return false;

        try {
            Map<String, Object> request = Map.of(ACCESS_TOKEN_KEY, accessToken);
            
            webClient.post()
                    .uri("/v1/link/disconnect")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("Disconnected account successfully");
            return true;
            
        } catch (Exception e) {
            log.error("Failed to disconnect account: {}", e.getMessage());
        }

        return false;
    }

    public List<Institution> getAvailableInstitutions() {
        return new ArrayList<>(SUPPORTED_INSTITUTIONS);
    }

    public Optional<Institution> findInstitution(String institutionId) {
        if (institutionId == null || institutionId.isBlank()) {
            return Optional.empty();
        }

        return getAvailableInstitutions().stream()
                .filter(institution -> institution.id().equalsIgnoreCase(institutionId))
                .findFirst();
    }

    public boolean isEnabled() {
        return enabled;
    }
}
