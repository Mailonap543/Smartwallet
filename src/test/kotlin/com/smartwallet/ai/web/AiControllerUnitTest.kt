package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.ai.chat.JarvisChatRequest
import com.smartwallet.ai.chat.JarvisChatResponse
import com.smartwallet.ai.chat.JarvisChatService
import com.smartwallet.ai.model.*
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.security.CustomUserDetails
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import java.math.BigDecimal
import java.time.LocalDate

class AiControllerUnitTest {

    private lateinit var aiController: AiController
    private lateinit var aiService: AIService
    private lateinit var walletRepository: WalletRepository
    private lateinit var assetRepository: AssetRepository
    private lateinit var jarvisChatService: JarvisChatService

    private val userId = 1L
    private lateinit var userDetails: CustomUserDetails

    @BeforeEach
    fun setup() {
        aiService = mock()
        walletRepository = mock()
        assetRepository = mock()
        jarvisChatService = mock()
        aiController = AiController(aiService, walletRepository, assetRepository, jarvisChatService)
        userDetails = CustomUserDetails(userId, "test", "test@test.com", emptySet())
    }

    @Test
    fun `analyzePortfolio returns analysis result`() {
        whenever(walletRepository.findByUserId(userId)).thenReturn(createWallets())
        whenever(assetRepository.findByUserId(userId)).thenReturn(createAssets())
        whenever(aiService.analyzePortfolio(eq(userId), any(), any())).thenReturn(createAnalysisResult())

        val response = aiController.analyzePortfolio(userDetails)

        assertTrue(response.body?.success == true)
        assertNotNull(response.body?.data)
    }

    @Test
    fun `getRiskMetrics returns risk metrics`() {
        whenever(walletRepository.findByUserId(userId)).thenReturn(createWallets())
        whenever(assetRepository.findByUserId(userId)).thenReturn(createAssets())
        whenever(aiService.analyzePortfolio(eq(userId), any(), any())).thenReturn(createAnalysisResult())

        val response = aiController.getRiskMetrics(userDetails)

        assertTrue(response.body?.success == true)
        assertEquals(RiskLevel.MODERATE, response.body?.data?.riskLevel)
    }

    @Test
    fun `getPortfolioScore returns score metrics`() {
        whenever(walletRepository.findByUserId(userId)).thenReturn(createWallets())
        whenever(assetRepository.findByUserId(userId)).thenReturn(createAssets())
        whenever(aiService.analyzePortfolio(eq(userId), any(), any())).thenReturn(createAnalysisResult())

        val response = aiController.getPortfolioScore(userDetails)

        assertTrue(response.body?.success == true)
        assertEquals(75, response.body?.data?.overallScore)
    }

    @Test
    fun `getRecommendations returns recommendations list`() {
        whenever(walletRepository.findByUserId(userId)).thenReturn(createWallets())
        whenever(assetRepository.findByUserId(userId)).thenReturn(createAssets())
        whenever(aiService.analyzePortfolio(eq(userId), any(), any())).thenReturn(createAnalysisResult())

        val response = aiController.getRecommendations(userDetails)

        assertTrue(response.body?.success == true)
        assertEquals(1, response.body?.data?.size)
    }

    @Test
    fun `chatWithJarvis returns chat response`() {
        val request = JarvisChatRequest(message = "Hello", sessionId = "session-123")
        whenever(walletRepository.findByUserId(userId)).thenReturn(createWallets())
        whenever(assetRepository.findByUserId(userId)).thenReturn(createAssets())
        whenever(aiService.analyzePortfolio(eq(userId), any(), any())).thenReturn(createAnalysisResult())
        whenever(jarvisChatService.chat(any(), any())).thenReturn(
            JarvisChatResponse(reply = "Hi there!", sessionId = "session-123")
        )

        val response = aiController.chatWithJarvis(userDetails, request)

        assertTrue(response.body?.success == true)
        assertEquals("Hi there!", response.body?.data?.reply)
    }

    @Test
    fun `chatWithJarvis generates new session when not provided`() {
        val request = JarvisChatRequest(message = "Hello", sessionId = null)
        whenever(walletRepository.findByUserId(userId)).thenReturn(createWallets())
        whenever(assetRepository.findByUserId(userId)).thenReturn(createAssets())
        whenever(aiService.analyzePortfolio(eq(userId), any(), any())).thenReturn(createAnalysisResult())
        whenever(jarvisChatService.chat(any(), any())).thenReturn(
            JarvisChatResponse(reply = "Response", sessionId = "new-session")
        )

        val response = aiController.chatWithJarvis(userDetails, request)

        assertNotNull(response.body?.data?.sessionId)
    }

    private fun createWallets(): List<com.smartwallet.entity.Wallet> = listOf(
        com.smartwallet.entity.Wallet(
            id = 1L,
            name = "Test",
            description = "Test wallet",
            totalBalance = BigDecimal("10000"),
            totalInvested = BigDecimal("10000"),
            totalProfitLoss = BigDecimal("0"),
            createdAt = LocalDate.now()
        )
    )

    private fun createAssets(): List<com.smartwallet.entity.Asset> = listOf(
        com.smartwallet.entity.Asset(
            symbol = "AAPL",
            name = "Apple",
            quantity = BigDecimal("10"),
            currentValue = BigDecimal("1500"),
            profitLoss = BigDecimal("100"),
            assetType = com.smartwallet.entity.AssetType.STOCK
        )
    )

    private fun createAnalysisResult(): AIService.AnalysisResult = AIService.AnalysisResult(
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
            recommendations = listOf("Test")
        ),
        recommendations = listOf(
            Recommendation(
                type = RecommendationType.HOLD,
                title = "Hold",
                description = "Test rec",
                priority = 999,
                potentialImpact = null,
                actionRequired = "Test"
            )
        )
    )
}