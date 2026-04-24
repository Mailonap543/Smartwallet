package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import com.smartwallet.service.HealthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.springframework.bind.annotation.RestController;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthComponent;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    private final HealthService healthService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", LocalDateTime.now());
        healthInfo.put("application", "smartwallet");
        healthInfo.put("version", "0.0.1-SNAPSHOT");
        
        Map<String, Object> components = new HashMap<>();
        components.put("database", healthService.checkDatabase());
        components.put("cache", healthService.checkCache());
        components.put("externalApi", healthService.checkExternalApi());
        
        healthInfo.put("components", components);
        
        return ResponseEntity.ok(healthInfo);
    }

    @GetMapping("/liveness")
    public ResponseEntity<Map<String, String>> liveness() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "ALIVE");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/readiness")
    public ResponseEntity<ApiResponse<Map<String, Object>>> readiness() {
        Map<String, Object> readiness = healthService.checkReadiness();
        if ((Boolean) readiness.get("ready")) {
            return ResponseEntity.ok(ApiResponse.success("Application is ready", readiness));
        } else {
            return ResponseEntity.status(503).body(ApiResponse.error("Application not ready", readiness));
        }
    }
}
