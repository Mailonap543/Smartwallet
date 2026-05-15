package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.ai.chat.JarvisChatRequest
import com.smartwallet.ai.chat.JarvisChatResponse
import com.smartwallet.ai.chat.JarvisChatService
import com.smartwallet.ai.model.*
import com.smartwallet.entity.Wallet
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.security.CustomUserDetails
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.math.BigDecimal
import java.time.LocalDate

@WebMvcTest(AiController::class)
class AiControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var aiService: AIService

    @MockBean
    private lateinit var walletRepository: WalletRepository

    @MockBean
    private lateinit var assetRepository: AssetRepository

    @MockBean
    private lateinit var jarvisChatService: JarvisChatService

    private lateinit var userDetails: CustomUserDetails

    @BeforeEach
    fun setup() {
        userDetails = CustomUserDetails(
            id = 1L,
            username = "testuser",
            email = "test@example.com",
            authorities = setOf()
        )
    }

    @Test
    fun `analyze endpoint returns analysis result`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/analyze")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
    }

    @Test
    fun `risk endpoint returns risk metrics`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/risk")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
    }

    @Test
    fun `score endpoint returns score metrics`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/score")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
    }

    @Test
    fun `recommendations endpoint returns list`() {
        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())

        mockMvc.perform(get("/api/ai/recommendations")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk)
    }

    @Test
    fun `chat endpoint returns jarvis response`() {
        val chatRequest = """
            {
                "message": "What is my risk?",
                "sessionId": "test-session"
            }
        """.trimIndent()

        whenever(walletRepository.findByUserId(1L)).thenReturn(createSampleWallets())
        whenever(assetRepository.findByUserId(1L)).thenReturn(createSampleAssets())
        whenever(aiService.analyzePortfolio(any(), any(), any())).thenReturn(createAnalysisResult())
        whenever(jarvisChatService.chat(any(), any())).thenReturn(
            JarvisChatResponse(reply = "Your risk is moderate", sessionId = "test-session")
        )

        mockMvc.perform(post("/api/ai/chat")
            .contentType(MediaType.APPLICATION_JSON)
            .content(chatRequest))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
    }

    private fun createSampleWallets(): List<Wallet> {
        return listOf(
            Wallet(
                id = 1L,
                name = "Retirement",
                description = "Retirement portfolio",
                totalBalance = BigDecimal("11000"),
                totalInvested = BigDecimal("10000"),
                totalProfitLoss = BigDecimal("1000"),
                createdAt = LocalDate.now()
            )
        )
    }

    private fun createSampleAssets(): List<com.smartwallet.entity.Asset> {
        return listOf(
            com.smartwallet.entity.Asset(
                symbol = "AAPL",
                name = "Apple",
                quantity = BigDecimal("10"),
                currentValue = BigDecimal("1500"),
                profitLoss = BigDecimal("100"),
                assetType = com.smartwallet.entity.AssetType.STOCK
            )
        )
    }

    private fun createAnalysisResult(): AIService.AnalysisResult {
        return AIService.AnalysisResult(
            riskMetrics = RiskMetrics(
                portfolioVolatility = BigDecimal("15.0"),
                sharpeRatio = BigDecimal("0.8"),
                beta = BigDecimal("1.1"),
                maxDrawdown = BigDecimal("8.0"),
                var95 = BigDecimal("3.0"),
                riskScore = 50,
                riskLevel = RiskLevel.MODERATE
            ),
            score = ScoreMetrics(
                overallScore = 75,
                diversificationScore = 35,
                riskReturnScore = 60,
                liquidityScore = 40,
                concentrationScore = 70,
                stabilityScore = 65,
                recommendations = listOf("Diversify")
            ),
            recommendations = listOf(
                Recommendation(
                    type = RecommendationType.HOLD,
                    title = "Hold",
                    description = "Hold position",
                    priority = 999,
                    potentialImpact = null,
                    actionRequired = "Monitor"
                )
            )
        )
    }
}