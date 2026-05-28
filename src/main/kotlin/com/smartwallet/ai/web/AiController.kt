package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.ai.chat.JarvisChatRequest
import com.smartwallet.ai.chat.JarvisChatResponse
import com.smartwallet.ai.chat.JarvisChatService
import com.smartwallet.ai.model.RiskMetrics
import com.smartwallet.ai.model.ScoreMetrics
import com.smartwallet.ai.model.Recommendation
import com.smartwallet.common.ApiResponse
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.security.AuthUserResolver
import com.smartwallet.security.CustomUserDetails
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = ["/api/ai", "/api/v1/ai"])
class AiController(
    private val aiService: AIService,
    private val walletRepository: WalletRepository,
    private val assetRepository: AssetRepository,
    private val jarvisChatService: JarvisChatService,
    private val authUserResolver: AuthUserResolver
) {

    @GetMapping("/analyze")
    fun analyzePortfolio(@AuthenticationPrincipal user: CustomUserDetails?): ResponseEntity<ApiResponse<AIService.AnalysisResult>> {
        val userId = currentUser(user).id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, message = "Análise concluída", data = result))
    }

    @GetMapping("/risk")
    fun getRiskMetrics(@AuthenticationPrincipal user: CustomUserDetails?): ResponseEntity<ApiResponse<RiskMetrics>> {
        val userId = currentUser(user).id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, data = result.riskMetrics))
    }

    @GetMapping("/score")
    fun getPortfolioScore(@AuthenticationPrincipal user: CustomUserDetails?): ResponseEntity<ApiResponse<ScoreMetrics>> {
        val userId = currentUser(user).id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, data = result.score))
    }

    @GetMapping("/recommendations")
    fun getRecommendations(@AuthenticationPrincipal user: CustomUserDetails?): ResponseEntity<ApiResponse<List<Recommendation>>> {
        val userId = currentUser(user).id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)
        val result = aiService.analyzePortfolio(userId, wallets, assets)
        return ResponseEntity.ok(ApiResponse(success = true, data = result.recommendations))
    }

    @PostMapping("/chat")
    fun chatWithJarvis(
        @AuthenticationPrincipal user: CustomUserDetails?,
        @RequestBody request: JarvisChatRequest
    ): ResponseEntity<ApiResponse<JarvisChatResponse>> {
        val userId = currentUser(user).id
        val wallets = walletRepository.findByUserId(userId)
        val assets = assetRepository.findByUserId(userId)

        val analysis = aiService.analyzePortfolio(userId, wallets, assets)
        val reply = jarvisChatService.chat(request, analysis)

        return ResponseEntity.ok(ApiResponse(success = true, message = "Resposta gerada", data = reply))
    }

    private fun currentUser(user: CustomUserDetails?): CustomUserDetails =
        user ?: authUserResolver.currentUser()
}
