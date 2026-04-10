package com.smartwallet.alert.controller;

import com.smartwallet.alert.entity.Alert;
import com.smartwallet.alert.repository.AlertRepository;
import com.smartwallet.dto.ApiResponse;
import com.smartwallet.market.entity.Asset;
import com.smartwallet.repository.AssetRepository;
import com.smartwallet.market.repository.AssetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final AssetRepository assetRepository;

    public AlertController(AlertRepository alertRepository, AssetRepository assetRepository) {
        this.alertRepository = alertRepository;
        this.assetRepository = assetRepository;
    }

    private Long getCurrentUserId() {
        return 1L;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Alert>>> getMyAlerts() {
        Long userId = getCurrentUserId();
        List<Alert> alerts = alertRepository.findByUserIdAndIsActiveTrue(userId);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Alert>> createAlert(@RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId();
        
        Alert alert = new Alert();
        alert.setUserId(userId);
        alert.setAssetSymbol(((String) body.get("symbol")).toUpperCase());
        alert.setAlertType(Alert.AlertType.valueOf((String) body.get("alertType")));
        alert.setConditionType(Alert.ConditionType.valueOf((String) body.get("conditionType")));
        alert.setTargetValue(new java.math.BigDecimal(body.get("targetValue").toString()));
        
        alert = alertRepository.save(alert);
        return ResponseEntity.ok(ApiResponse.success("Alerta criado com sucesso", alert));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Alert>> updateAlert(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return alertRepository.findById(id)
            .map(alert -> {
                if (body.containsKey("targetValue")) {
                    alert.setTargetValue(new java.math.BigDecimal(body.get("targetValue").toString()));
                }
                if (body.containsKey("isActive")) {
                    alert.setActive((Boolean) body.get("isActive"));
                }
                alert = alertRepository.save(alert);
                return ResponseEntity.ok(ApiResponse.success("Alerta atualizado", alert));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(@PathVariable Long id) {
        alertRepository.findById(id).ifPresent(alertRepository::delete);
        return ResponseEntity.ok(ApiResponse.success("Alerta removido", null));
    }

    @GetMapping("/check/{symbol}")
    public ResponseEntity<ApiResponse<List<Alert>>> checkAlerts(@PathVariable String symbol) {
        List<Alert> alerts = alertRepository.findByAssetSymbolAndIsActiveTrue(symbol.toUpperCase());
        
        List<Alert> triggered = alerts.stream()
            .filter(alert -> shouldTrigger(alert))
            .toList();
        
        triggered.forEach(alert -> {
            alert.setTriggeredAt(java.time.LocalDateTime.now());
            alert.setActive(false);
            alertRepository.save(alert);
        });
        
        return ResponseEntity.ok(ApiResponse.success(triggered));
    }

    private boolean shouldTrigger(Alert alert) {
        return assetRepository.findBySymbol(alert.getAssetSymbol())
            .map(asset -> {
                double currentPrice = asset.getCurrentPrice() != null ? asset.getCurrentPrice().doubleValue() : 0;
                double target = alert.getTargetValue() != null ? alert.getTargetValue().doubleValue() : 0;
                
                return switch (alert.getConditionType()) {
                    case GREATER_THAN -> currentPrice > target;
                    case LESS_THAN -> currentPrice < target;
                    case EQUALS -> Math.abs(currentPrice - target) < 0.01;
                    default -> false;
                };
            })
            .orElse(false);
    }
}