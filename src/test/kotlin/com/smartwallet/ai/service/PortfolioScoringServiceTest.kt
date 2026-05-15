package com.smartwallet.ai.service

import com.smartwallet.ai.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate

class PortfolioScoringServiceTest {

    private lateinit var scoringService: PortfolioScoringService

    @BeforeEach
    fun setup() {
        scoringService = PortfolioScoringService()
    }

    @Test
    fun `calculateScore returns metrics for valid portfolio`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = createSampleRiskMetrics()

        val score = scoringService.calculateScore(portfolio, riskMetrics, emptyMap())

        assertNotNull(score)
        assertTrue(score.overallScore in 0..100)
        assertTrue(score.diversificationScore in 0..50)
        assertTrue(score.riskReturnScore in 0..80)
        assertTrue(score.liquidityScore in 0..50)
    }

    @Test
    fun `calculateScore handles empty portfolio`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = emptyList(),
            totalInvested = BigDecimal.ZERO,
            totalCurrentValue = BigDecimal.ZERO,
            totalProfitLoss = BigDecimal.ZERO,
            profitLossPercentage = BigDecimal.ZERO
        )
        val riskMetrics = createSampleRiskMetrics()

        val score = scoringService.calculateScore(portfolio, riskMetrics, emptyMap())

        assertEquals(0, score.diversificationScore)
        assertEquals(0, score.liquidityScore)
    }

    @Test
    fun `calculateDiversificationScore higher for diverse portfolio`() {
        val diversePortfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("AAPL", "STOCK"),
                createAsset("GOOGL", "STOCK"),
                createAsset("BTC", "CRYPTO"),
                createAsset("GLD", "COMMODITY"),
                createAsset("VNQ", "ETF")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )
        val consolidatedPortfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("AAPL", "STOCK"),
                createAsset("MSFT", "STOCK")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("10500"),
            totalProfitLoss = BigDecimal("500"),
            profitLossPercentage = BigDecimal("5")
        )

        val riskMetrics = createSampleRiskMetrics()
        val diverseScore = scoringService.calculateScore(diversePortfolio, riskMetrics, emptyMap())
        val consolidatedScore = scoringService.calculateScore(consolidatedPortfolio, riskMetrics, emptyMap())

        assertTrue(diverseScore.diversificationScore >= consolidatedScore.diversificationScore)
    }

    @Test
    fun `calculateLiquidityScore higher for liquid assets`() {
        val liquidPortfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("AAPL", "STOCK"),
                createAsset("GOOGL", "STOCK"),
                createAsset("BTC", "CRYPTO")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )
        val illiquidPortfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("FII1", "FII"),
                createAsset("FII2", "FII"),
                createAsset("BOND1", "BOND")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("10500"),
            totalProfitLoss = BigDecimal("500"),
            profitLossPercentage = BigDecimal("5")
        )

        val riskMetrics = createSampleRiskMetrics()
        val liquidScore = scoringService.calculateScore(liquidPortfolio, riskMetrics, emptyMap())
        val illiquidScore = scoringService.calculateScore(illiquidPortfolio, riskMetrics, emptyMap())

        assertTrue(liquidScore.liquidityScore > illiquidScore.liquidityScore)
    }

    @Test
    fun `calculateConcentrationScore penalizes concentrated holdings`() {
        val concentratedPortfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                AssetData(
                    symbol = "AAPL",
                    name = "Apple",
                    quantity = BigDecimal("100"),
                    currentPrice = BigDecimal("150"),
                    averagePrice = BigDecimal("140"),
                    assetType = "STOCK",
                    currentValue = BigDecimal("15000"),
                    profitLoss = BigDecimal("1000"),
                    profitLossPercentage = BigDecimal("7.14"),
                    purchaseDate = LocalDate.now()
                ),
                createAsset("CASH", "CASH")
            ),
            totalInvested = BigDecimal("14000"),
            totalCurrentValue = BigDecimal("15000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("7.14")
        )
        val diversifiedPortfolio = PortfolioData(
            userId = 1L,
            assets = (1..10).map { createAsset("STOCK$it", "STOCK") },
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )

        val riskMetrics = createSampleRiskMetrics()
        val concentratedScore = scoringService.calculateScore(concentratedPortfolio, riskMetrics, emptyMap())
        val diversifiedScore = scoringService.calculateScore(diversifiedPortfolio, riskMetrics, emptyMap())

        assertTrue(diversifiedScore.concentrationScore >= concentratedScore.concentrationScore)
    }

    @Test
    fun `generateImprovementRecommendations returns recommendations`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = createSampleRiskMetrics()

        val score = scoringService.calculateScore(portfolio, riskMetrics, emptyMap())

        assertNotNull(score.recommendations)
        assertTrue(score.recommendations.isNotEmpty())
    }

    private fun createSamplePortfolio(): PortfolioData {
        return PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("AAPL", "STOCK"),
                createAsset("GOOGL", "STOCK"),
                createAsset("BTC", "CRYPTO"),
                createAsset("VNQ", "ETF")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )
    }

    private fun createAsset(symbol: String, type: String): AssetData {
        return AssetData(
            symbol = symbol,
            name = symbol,
            quantity = BigDecimal("10"),
            currentPrice = BigDecimal("100"),
            averagePrice = BigDecimal("90"),
            assetType = type,
            currentValue = BigDecimal("1000"),
            profitLoss = BigDecimal("100"),
            profitLossPercentage = BigDecimal("11.11"),
            purchaseDate = LocalDate.now().minusMonths(6)
        )
    }

    private fun createSampleRiskMetrics(): RiskMetrics {
        return RiskMetrics(
            portfolioVolatility = BigDecimal("15.0"),
            sharpeRatio = BigDecimal("0.8"),
            beta = BigDecimal("1.1"),
            maxDrawdown = BigDecimal("8.0"),
            var95 = BigDecimal("3.0"),
            riskScore = 50,
            riskLevel = RiskLevel.MODERATE
        )
    }
}