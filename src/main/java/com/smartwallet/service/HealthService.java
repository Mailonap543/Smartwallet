package com.smartwallet.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class HealthService {

    @PersistenceContext
    private EntityManager entityManager;

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${smartwallet.ai.python.base-url:http://localhost:8001}")
    private String aiPythonBaseUrl;

    @Value("${smartwallet.ai.python.timeout-ms:2000}")
    private long aiPythonTimeoutMs;

    public Map<String, Object> checkDatabase() {
        Map<String, Object> dbStatus = new HashMap<>();
        try {
            entityManager.createNativeQuery("SELECT 1").getSingleResult();
            dbStatus.put("status", "UP");
            dbStatus.put("details", "Database connection successful");
        } catch (Exception e) {
            log.error("Database health check failed", e);
            dbStatus.put("status", "DOWN");
            dbStatus.put("details", e.getMessage());
        }
        return dbStatus;
    }

    public Map<String, Object> checkCache() {
        Map<String, Object> cacheStatus = new HashMap<>();
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            cacheStatus.put("status", "UP");
            cacheStatus.put("details", "Redis connection successful");
        } catch (Exception e) {
            log.error("Cache health check failed", e);
            cacheStatus.put("status", "DOWN");
            cacheStatus.put("details", e.getMessage());
        }
        return cacheStatus;
    }

    public Map<String, Object> checkExternalApi() {
        Map<String, Object> apiStatus = new HashMap<>();
        try {
            WebClient webClient = WebClient.builder()
                    .baseUrl(aiPythonBaseUrl)
                    .build();

            String response = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofMillis(aiPythonTimeoutMs))
                    .onErrorResume(e -> Mono.just("{\"ok\":false}"))
                    .block();

            if (response != null && response.contains("\"ok\":true")) {
                apiStatus.put("aiService", "UP");
                apiStatus.put("details", "AI Python service responding");
            } else {
                apiStatus.put("aiService", "DOWN");
                apiStatus.put("details", "AI Python service returned unexpected response");
            }
        } catch (Exception e) {
            log.warn("AI service health check failed", e);
            apiStatus.put("aiService", "DOWN");
            apiStatus.put("details", e.getMessage());
        }
        apiStatus.put("status", "UP");
        return apiStatus;
    }

    public Map<String, Object> checkReadiness() {
        Map<String, Object> readiness = new HashMap<>();
        
        Map<String, Object> dbCheck = checkDatabase();
        Map<String, Object> cacheCheck = checkCache();
        
        boolean dbReady = "UP".equals(dbCheck.get("status"));
        boolean cacheReady = "UP".equals(cacheCheck.get("status"));
        
        readiness.put("ready", dbReady && cacheReady);
        readiness.put("database", dbCheck);
        readiness.put("cache", cacheCheck);
        readiness.put("timestamp", System.currentTimeMillis());
        
        return readiness;
    }
}
