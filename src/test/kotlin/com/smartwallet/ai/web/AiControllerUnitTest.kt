package com.smartwallet.ai.web

import com.smartwallet.ai.AIService
import com.smartwallet.ai.chat.JarvisChatRequest
import com.smartwallet.ai.chat.JarvisChatResponse
import com.smartwallet.ai.chat.JarvisChatService
import com.smartwallet.ai.model.*
import com.smartwallet.entity.Asset
import com.smartwallet.entity.AssetType
import com.smartwallet.entity.User
import com.smartwallet.entity.Wallet
import com.smartwallet.repository.AssetRepository
import com.smartwallet.repository.WalletRepository
import com.smartwallet.security.CustomUserDetails
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

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
        userDetails = CustomUserDetails(createUser())
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

    private fun createWallets(): List<Wallet> = listOf(
        Wallet().apply {
            id = 1L
            name = "Test"
            description = "Test wallet"
            totalBalance = BigDecimal("10000")
            totalInvested = BigDecimal("10000")
            totalProfitLoss = BigDecimal("0")
            createdAt = LocalDateTime.now()
            updatedAt = LocalDateTime.now()
        }
    )

    private fun createAssets(): List<Asset> = listOf(
        Asset().apply {
            symbol = "AAPL"
            name = "Apple"
            quantity = BigDecimal("10")
            purchasePrice = BigDecimal("140")
            averagePrice = BigDecimal("140")
            currentPrice = BigDecimal("150")
            currentValue = BigDecimal("1500")
            profitLoss = BigDecimal("100")
            assetType = AssetType.STOCK
            purchaseDate = LocalDate.now()
        }
    )

    private fun createUser(): User = User().apply {
        id = userId
        email = "test@test.com"
        passwordHash = "password"
        fullName = "Test User"
        isActive = true
        emailVerified = true
        role = "USER"
    }

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
