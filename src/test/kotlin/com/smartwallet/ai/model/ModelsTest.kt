package com.smartwallet.ai.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate

class ModelsTest {

    @Test
    fun `RiskMetrics can be created with all fields`() {
        val metrics = RiskMetrics(
            portfolioVolatility = BigDecimal("15.5"),
            sharpeRatio = BigDecimal("0.85"),
            beta = BigDecimal("1.2"),
            maxDrawdown = BigDecimal("10.0"),
            var95 = BigDecimal("5.0"),
            riskScore = 65,
            riskLevel = RiskLevel.MODERATE
        )

        assertEquals(BigDecimal("15.5"), metrics.portfolioVolatility)
        assertEquals(65, metrics.riskScore)
        assertEquals(RiskLevel.MODERATE, metrics.riskLevel)
    }

    @Test
    fun `ScoreMetrics can be created with all fields`() {
        val score = ScoreMetrics(
            overallScore = 80,
            diversificationScore = 40,
            riskReturnScore = 65,
            liquidityScore = 45,
            concentrationScore = 75,
            stabilityScore = 70,
            recommendations = listOf("Add bonds", "Diversify")
        )

        assertEquals(80, score.overallScore)
        assertEquals(2, score.recommendations.size)
    }

    @Test
    fun `Recommendation can be created with all fields`() {
        val rec = Recommendation(
            type = RecommendationType.BUY_OPPORTUNITY,
            title = "Buy Opportunity",
            description = "Good time to buy",
            priority = 1,
            potentialImpact = BigDecimal("15.0"),
            actionRequired = "Buy now"
        )

        assertEquals(RecommendationType.BUY_OPPORTUNITY, rec.type)
        assertEquals(1, rec.priority)
    }

    @Test
    fun `AssetData can be created with all fields`() {
        val asset = AssetData(
            symbol = "AAPL",
            name = "Apple Inc",
            quantity = BigDecimal("10"),
            currentPrice = BigDecimal("150.00"),
            averagePrice = BigDecimal("140.00"),
            assetType = "STOCK",
            currentValue = BigDecimal("1500.00"),
            profitLoss = BigDecimal("100.00"),
            profitLossPercentage = BigDecimal("7.14"),
            purchaseDate = LocalDate.now()
        )

        assertEquals("AAPL", asset.symbol)
        assertEquals("STOCK", asset.assetType)
    }

    @Test
    fun `PortfolioData can be created with all fields`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                AssetData(
                    symbol = "AAPL",
                    name = "Apple",
                    quantity = BigDecimal("10"),
                    currentPrice = BigDecimal("150"),
                    averagePrice = BigDecimal("140"),
                    assetType = "STOCK",
                    currentValue = BigDecimal("1500"),
                    profitLoss = BigDecimal("100"),
                    profitLossPercentage = BigDecimal("7.14"),
                    purchaseDate = LocalDate.now()
                )
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )

        assertEquals(1L, portfolio.userId)
        assertEquals(1, portfolio.assets.size)
    }

    @Test
    fun `MarketData can be created with all fields`() {
        val market = MarketData(
            symbol = "AAPL",
            price = BigDecimal("150.00"),
            change = BigDecimal("5.00"),
            changePercent = BigDecimal("3.45"),
            dayHigh = BigDecimal("155.00"),
            dayLow = BigDecimal("145.00"),
            volume = 1000000L,
            lastUpdate = null
        )

        assertEquals("AAPL", market.symbol)
        assertEquals(BigDecimal("3.45"), market.changePercent)
    }

    @Test
    fun `RiskLevel enum values are accessible`() {
        assertEquals(5, RiskLevel.values().size)
        assertTrue(RiskLevel.values().contains(RiskLevel.VERY_LOW))
        assertTrue(RiskLevel.values().contains(RiskLevel.LOW))
        assertTrue(RiskLevel.values().contains(RiskLevel.MODERATE))
        assertTrue(RiskLevel.values().contains(RiskLevel.HIGH))
        assertTrue(RiskLevel.values().contains(RiskLevel.VERY_HIGH))
    }

    @Test
    fun `RecommendationType enum values are accessible`() {
        assertTrue(RecommendationType.values().isNotEmpty())
        assertTrue(RecommendationType.values().contains(RecommendationType.DIVERSIFY))
        assertTrue(RecommendationType.values().contains(RecommendationType.REDUCE_RISK))
        assertTrue(RecommendationType.values().contains(RecommendationType.BUY_OPPORTUNITY))
        assertTrue(RecommendationType.values().contains(RecommendationType.SELL_WARNING))
        assertTrue(RecommendationType.values().contains(RecommendationType.HOLD))
    }

    @Test
    fun `AnalysisResult can be created`() {
        val result = AnalysisResult(
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
                recommendations = emptyList()
            ),
            recommendations = emptyList()
        )

        assertNotNull(result.riskMetrics)
        assertNotNull(result.score)
    }
}