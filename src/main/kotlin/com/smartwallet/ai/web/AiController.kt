package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.ai.model.RiskMetrics
import com.smartwallet.ai.model.ScoreMetrics
import com.smartwallet.ai.model.Recommendation
import com.smartwallet.common.ApiResponse
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.security.CustomUserDetails
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/ai", "/api/v1/ai"])
class AiController(
    private val aiService: AIService,
    private val walletRepository: WalletRepository,
    private val assetRepository: AssetRepository
) {

    @GetMapping("/analyze")
    fun analyzePortfolio(@AuthenticationPrincipal user: CustomUserDetails): ResponseEntity<ApiResponse<AIService.AnalysisResult>> {
        val userId = user.id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, message = "Análise concluída", data = result))
    }

    @GetMapping("/risk")
    fun getRiskMetrics(@AuthenticationPrincipal user: CustomUserDetails): ResponseEntity<ApiResponse<RiskMetrics>> {
        val userId = user.id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, data = result.riskMetrics))
    }

    @GetMapping("/score")
    fun getPortfolioScore(@AuthenticationPrincipal user: CustomUserDetails): ResponseEntity<ApiResponse<ScoreMetrics>> {
        val userId = user.id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, data = result.score))
    }

    @GetMapping("/recommendations")
    fun getRecommendations(@AuthenticationPrincipal user: CustomUserDetails): ResponseEntity<ApiResponse<List<Recommendation>>> {
        val userId = user.id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, data = result.recommendations))
    }
}
