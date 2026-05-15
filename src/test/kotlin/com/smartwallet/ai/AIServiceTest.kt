package com.smartwallet.ai

import com.smartwallet.ai.model.*
import com.smartwallet.ai.service.PortfolioScoringService
import com.smartwallet.ai.service.RecommendationEngine
import com.smartwallet.ai.service.RiskAnalysisService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate

class AIServiceTest {

    private lateinit var aiService: AIService
    private lateinit var riskAnalysisService: RiskAnalysisService
    private lateinit var portfolioScoringService: PortfolioScoringService
    private lateinit var recommendationEngine: RecommendationEngine

    @BeforeEach
    fun setup() {
        riskAnalysisService = RiskAnalysisService()
        portfolioScoringService = PortfolioScoringService()
        recommendationEngine = RecommendationEngine()
        aiService = AIService(riskAnalysisService, portfolioScoringService, recommendationEngine)
    }

    @Test
    fun `analyzePortfolio returns result with all components`() {
        val result = aiService.analyzePortfolio(
            userId = 1L,
            wallets = createSampleWallets(),
            assets = createSampleAssets()
        )

        assertNotNull(result)
        assertNotNull(result.riskMetrics)
        assertNotNull(result.score)
        assertNotNull(result.recommendations)
    }

    @Test
    fun `analyzePortfolio returns risk metrics`() {
        val result = aiService.analyzePortfolio(
            userId = 1L,
            wallets = createSampleWallets(),
            assets = createSampleAssets()
        )

        assertNotNull(result.riskMetrics.portfolioVolatility)
        assertNotNull(result.riskMetrics.sharpeRatio)
        assertNotNull(result.riskMetrics.beta)
        assertNotNull(result.riskMetrics.riskLevel)
        assertTrue(result.riskMetrics.riskScore in 0..100)
    }

    @Test
    fun `analyzePortfolio returns score metrics`() {
        val result = aiService.analyzePortfolio(
            userId = 1L,
            wallets = createSampleWallets(),
            assets = createSampleAssets()
        )

        assertTrue(result.score.overallScore in 0..100)
        assertTrue(result.score.diversificationScore in 0..50)
        assertTrue(result.score.riskReturnScore in 0..80)
        assertTrue(result.score.liquidityScore in 0..50)
    }

    @Test
    fun `analyzePortfolio returns recommendations when analysis complete`() {
        val result = aiService.analyzePortfolio(
            userId = 1L,
            wallets = createSampleWallets(),
            assets = createSampleAssets()
        )

        assertNotNull(result.recommendations)
        assertTrue(result.recommendations.isNotEmpty())
    }

    @Test
    fun `analyzePortfolio returns fallback recommendations when engine returns empty`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = emptyList(),
            totalInvested = BigDecimal.ZERO,
            totalCurrentValue = BigDecimal.ZERO,
            totalProfitLoss = BigDecimal.ZERO,
            profitLossPercentage = BigDecimal.ZERO
        )

        val wallets = listOf(
            Wallet(
                id = 1L,
                name = "Test Wallet",
                description = "Test",
                totalBalance = BigDecimal.ZERO,
                totalInvested = BigDecimal.ZERO,
                totalProfitLoss = BigDecimal.ZERO,
                createdAt = LocalDate.now()
            )
        )

        val result = aiService.analyzePortfolio(userId = 1L, wallets = wallets, assets = emptyList())

        assertNotNull(result.recommendations)
        assertTrue(result.recommendations.isNotEmpty())
        val holdRec = result.recommendations.find { it.type == RecommendationType.HOLD }
        assertNotNull(holdRec)
    }

    @Test
    fun `simple analyzePortfolio returns map with correct structure`() {
        val result = aiService.analyzePortfolio(userId = 1L)

        assertEquals("analyzed", result["status"])
        assertNotNull(result["riskMetrics"])
        assertNotNull(result["recommendations"])
        assertNotNull(result["score"])
    }

    @Test
    fun `simple analyzePortfolio risk metrics structure`() {
        val result = aiService.analyzePortfolio(userId = 1L)
        val riskMetrics = result["riskMetrics"] as Map<*, *>

        assertEquals(50, riskMetrics["riskScore"])
        assertEquals("MODERATE", riskMetrics["riskLevel"])
    }

    @Test
    fun `getRecommendations returns list of maps`() {
        val recommendations = aiService.getRecommendations()

        assertNotNull(recommendations)
        assertTrue(recommendations.isNotEmpty())
        assertTrue(recommendations.all {
            it.containsKey("type") &&
            it.containsKey("title") &&
            it.containsKey("description") &&
            it.containsKey("priority")
        })
    }

    @Test
    fun `calculateScore returns int in valid range`() {
        val score = aiService.calculateScore()

        assertTrue(score in 0..100)
    }

    private fun createSampleWallets(): List<com.smartwallet.entity.Wallet> {
        return listOf(
            com.smartwallet.entity.Wallet(
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
                currentPrice = BigDecimal("150"),
                averagePrice = BigDecimal("140"),
                currentValue = BigDecimal("1500"),
                profitLoss = BigDecimal("100"),
                profitLossPercentage = BigDecimal("7.14"),
                assetType = com.smartwallet.entity.AssetType.STOCK,
                purchaseDate = LocalDate.now().minusMonths(6)
            ),
            com.smartwallet.entity.Asset(
                symbol = "GOOGL",
                name = "Google",
                quantity = BigDecimal("5"),
                currentPrice = BigDecimal("2800"),
                averagePrice = BigDecimal("2700"),
                currentValue = BigDecimal("14000"),
                profitLoss = BigDecimal("500"),
                profitLossPercentage = BigDecimal("3.70"),
                assetType = com.smartwallet.entity.AssetType.STOCK,
                purchaseDate = LocalDate.now().minusMonths(3)
            ),
            com.smartwallet.entity.Asset(
                symbol = "BTC",
                name = "Bitcoin",
                quantity = BigDecimal("0.5"),
                currentPrice = BigDecimal("60000"),
                averagePrice = BigDecimal("55000"),
                currentValue = BigDecimal("30000"),
                profitLoss = BigDecimal("2500"),
                profitLossPercentage = BigDecimal("8.33"),
                assetType = com.smartwallet.entity.AssetType.CRYPTO,
                purchaseDate = LocalDate.now().minusMonths(1)
            )
        )
    }
}