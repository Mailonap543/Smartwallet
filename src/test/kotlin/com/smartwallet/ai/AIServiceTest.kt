package com.smartwallet.ai

import com.smartwallet.ai.model.*
import com.smartwallet.ai.service.PortfolioScoringService
import com.smartwallet.ai.service.RecommendationEngine
import com.smartwallet.ai.service.RiskAnalysisService
import com.smartwallet.entity.Asset
import com.smartwallet.entity.AssetType
import com.smartwallet.entity.Wallet
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

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
        val wallets = listOf(
            createWallet(
                id = 1L,
                name = "Test Wallet",
                description = "Test",
                totalBalance = BigDecimal.ZERO,
                totalInvested = BigDecimal.ZERO,
                totalProfitLoss = BigDecimal.ZERO
            )
        )

        val result = aiService.analyzePortfolio(userId = 1L, wallets = wallets, assets = emptyList())

        assertNotNull(result.recommendations)
        assertTrue(result.recommendations.isNotEmpty())
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

    private fun createSampleWallets(): List<Wallet> {
        return listOf(
            createWallet(
                id = 1L,
                name = "Retirement",
                description = "Retirement portfolio",
                totalBalance = BigDecimal("11000"),
                totalInvested = BigDecimal("10000"),
                totalProfitLoss = BigDecimal("1000")
            )
        )
    }

    private fun createSampleAssets(): List<Asset> {
        return listOf(
            createAsset(
                symbol = "AAPL",
                name = "Apple",
                quantity = BigDecimal("10"),
                currentPrice = BigDecimal("150"),
                averagePrice = BigDecimal("140"),
                currentValue = BigDecimal("1500"),
                profitLoss = BigDecimal("100"),
                profitLossPercentage = BigDecimal("7.14"),
                assetType = AssetType.STOCK,
                purchaseDate = LocalDate.now().minusMonths(6)
            ),
            createAsset(
                symbol = "GOOGL",
                name = "Google",
                quantity = BigDecimal("5"),
                currentPrice = BigDecimal("2800"),
                averagePrice = BigDecimal("2700"),
                currentValue = BigDecimal("14000"),
                profitLoss = BigDecimal("500"),
                profitLossPercentage = BigDecimal("3.70"),
                assetType = AssetType.STOCK,
                purchaseDate = LocalDate.now().minusMonths(3)
            ),
            createAsset(
                symbol = "BTC",
                name = "Bitcoin",
                quantity = BigDecimal("0.5"),
                currentPrice = BigDecimal("60000"),
                averagePrice = BigDecimal("55000"),
                currentValue = BigDecimal("30000"),
                profitLoss = BigDecimal("2500"),
                profitLossPercentage = BigDecimal("8.33"),
                assetType = AssetType.CRYPTO,
                purchaseDate = LocalDate.now().minusMonths(1)
            )
        )
    }

    private fun createWallet(
        id: Long,
        name: String,
        description: String,
        totalBalance: BigDecimal,
        totalInvested: BigDecimal,
        totalProfitLoss: BigDecimal
    ): Wallet = Wallet().apply {
        this.id = id
        this.name = name
        this.description = description
        this.totalBalance = totalBalance
        this.totalInvested = totalInvested
        this.totalProfitLoss = totalProfitLoss
        this.createdAt = LocalDateTime.now()
        this.updatedAt = LocalDateTime.now()
    }

    private fun createAsset(
        symbol: String,
        name: String,
        quantity: BigDecimal,
        currentPrice: BigDecimal,
        averagePrice: BigDecimal,
        currentValue: BigDecimal,
        profitLoss: BigDecimal,
        profitLossPercentage: BigDecimal,
        assetType: AssetType,
        purchaseDate: LocalDate
    ): Asset = Asset().apply {
        this.symbol = symbol
        this.name = name
        this.quantity = quantity
        this.currentPrice = currentPrice
        this.averagePrice = averagePrice
        this.purchasePrice = averagePrice
        this.totalInvested = averagePrice.multiply(quantity)
        this.currentValue = currentValue
        this.profitLoss = profitLoss
        this.profitLossPercentage = profitLossPercentage
        this.assetType = assetType
        this.purchaseDate = purchaseDate
    }
}
