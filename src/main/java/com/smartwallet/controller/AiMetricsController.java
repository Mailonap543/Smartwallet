package com.smartwallet.controller;

import com.smartwallet.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiMetricsController {

    @GetMapping("/risk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRiskMetrics() {
        Map<String, Object> response = Map.of(
                "portfolioVolatility", 0,
                "sharpeRatio", 0,
                "beta", 0,
                "maxDrawdown", 0,
                "var95", 0,
                "riskScore", 0,
                "riskLevel", "Sem dados"
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/score")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPortfolioScore() {
        Map<String, Object> response = Map.of(
                "overallScore", 0,
                "diversificationScore", 0,
                "riskReturnScore", 0,
                "liquidityScore", 0,
                "concentrationScore", 0,
                "stabilityScore", 0,
                "recommendations", List.of("Cadastre uma carteira e ativos para gerar uma analise completa.")
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecommendations() {
        List<Map<String, Object>> response = List.of(
                Map.of(
                        "type", "INFO",
                        "title", "Comece adicionando uma carteira",
                        "description", "Depois de cadastrar seus ativos, o SmartWallet consegue calcular risco, score e recomendacoes.",
                        "priority", 1,
                        "actionRequired", "Criar carteira"
                )
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
