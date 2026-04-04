package com.smartwallet.controller;

import com.smartwallet.ai.AIService;
import com.smartwallet.ai.model.*;
import com.smartwallet.dto.ApiResponse;
import com.smartwallet.entity.Asset;
import com.smartwallet.entity.Wallet;
import com.smartwallet.repository.AssetRepository;
import com.smartwallet.repository.WalletRepository;
import com.smartwallet.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final WalletRepository walletRepository;
    private final AssetRepository assetRepository;

    @GetMapping("/analyze")
    public ResponseEntity<ApiResponse<AIService.AnalysisResult>> analyzePortfolio(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        List<Wallet> wallets = walletRepository.findByUserId(user.getId());
        List<Asset> assets = assetRepository.findByUserId(user.getId());
        
        AIService.AnalysisResult result = aiService.analyzePortfolio(user.getId(), wallets, assets);
        
        return ResponseEntity.ok(ApiResponse.success("Análise concluída", result));
    }

    @GetMapping("/risk")
    public ResponseEntity<ApiResponse<RiskMetrics>> getRiskMetrics(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        List<Wallet> wallets = walletRepository.findByUserId(user.getId());
        List<Asset> assets = assetRepository.findByUserId(user.getId());
        
        AIService.AnalysisResult result = aiService.analyzePortfolio(user.getId(), wallets, assets);
        
        return ResponseEntity.ok(ApiResponse.success(result.riskMetrics()));
    }

    @GetMapping("/score")
    public ResponseEntity<ApiResponse<ScoreMetrics>> getPortfolioScore(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        List<Wallet> wallets = walletRepository.findByUserId(user.getId());
        List<Asset> assets = assetRepository.findByUserId(user.getId());
        
        AIService.AnalysisResult result = aiService.analyzePortfolio(user.getId(), wallets, assets);
        
        return ResponseEntity.ok(ApiResponse.success(result.score()));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<Recommendation>>> getRecommendations(
            @AuthenticationPrincipal CustomUserDetails user) {
        
        List<Wallet> wallets = walletRepository.findByUserId(user.getId());
        List<Asset> assets = assetRepository.findByUserId(user.getId());
        
        AIService.AnalysisResult result = aiService.analyzePortfolio(user.getId(), wallets, assets);
        
        return ResponseEntity.ok(ApiResponse.success(result.recommendations()));
    }
}