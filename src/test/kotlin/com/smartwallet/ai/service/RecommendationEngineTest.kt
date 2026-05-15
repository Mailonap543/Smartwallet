package com.smartwallet.ai.service

import com.smartwallet.ai.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate

class RecommendationEngineTest {

    private lateinit var recommendationEngine: RecommendationEngine

    @BeforeEach
    fun setup() {
        recommendationEngine = RecommendationEngine()
    }

    @Test
    fun `generateRecommendations returns list for valid portfolio`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = createSampleRiskMetrics()
        val marketData = emptyMap<String, MarketData>()

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, marketData)

        assertNotNull(recommendations)
        assertTrue(recommendations.all { it.priority > 0 })
    }

    @Test
    fun `analyzeDiversification detects single type concentration`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("AAPL", "STOCK"),
                createAsset("MSFT", "STOCK"),
                createAsset("GOOGL", "STOCK")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )
        val riskMetrics = createSampleRiskMetrics()

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, emptyMap())

        val diversificationRec = recommendations.find { it.type == RecommendationType.DIVERSIFY }
        assertNotNull(diversificationRec)
    }

    @Test
    fun `analyzeRisk detects high risk portfolio`() {
        val portfolio = createSamplePortfolio()
        val highRiskMetrics = RiskMetrics(
            portfolioVolatility = BigDecimal("30.0"),
            sharpeRatio = BigDecimal("-0.5"),
            beta = BigDecimal("1.8"),
            maxDrawdown = BigDecimal("25.0"),
            var95 = BigDecimal("15.0"),
            riskScore = 90,
            riskLevel = RiskLevel.VERY_HIGH
        )

        val recommendations = recommendationEngine.generateRecommendations(portfolio, highRiskMetrics, emptyMap())

        val reduceRiskRec = recommendations.find { it.type == RecommendationType.REDUCE_RISK }
        assertNotNull(reduceRiskRec)
        assertTrue(reduceRiskRec?.priority == 1)
    }

    @Test
    fun `analyzeRisk detects elevated VaR`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = RiskMetrics(
            portfolioVolatility = BigDecimal("15.0"),
            sharpeRatio = BigDecimal("0.8"),
            beta = BigDecimal("1.1"),
            maxDrawdown = BigDecimal("10.0"),
            var95 = BigDecimal("15.0"),
            riskScore = 60,
            riskLevel = RiskLevel.HIGH
        )

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, emptyMap())

        val watchRec = recommendations.find { it.type == RecommendationType.WATCH_LIST && it.title.contains("VaR") }
        assertNotNull(watchRec)
    }

    @Test
    fun `analyzeConcentration detects high concentration`() {
        val portfolio = PortfolioData(
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
        val riskMetrics = createSampleRiskMetrics()

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, emptyMap())

        val concentrationRec = recommendations.find { it.type == RecommendationType.DIVERSIFY && it.title.contains("Concentração") }
        assertNotNull(concentrationRec)
    }

    @Test
    fun `analyzeMarketOpportunities detects buy chances`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = createSampleRiskMetrics()
        val marketData = mapOf(
            "AAPL" to MarketData(
                symbol = "AAPL",
                price = BigDecimal("150"),
                change = BigDecimal("-20"),
                changePercent = BigDecimal("-12.0"),
                dayHigh = BigDecimal("170"),
                dayLow = BigDecimal("145"),
                volume = 1000000L,
                lastUpdate = null
            )
        )

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, marketData)

        val buyRec = recommendations.find { it.type == RecommendationType.BUY_OPPORTUNITY }
        assertNotNull(buyRec)
    }

    @Test
    fun `analyzeMarketOpportunities detects sell warnings`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = createSampleRiskMetrics()
        val marketData = mapOf(
            "AAPL" to MarketData(
                symbol = "AAPL",
                price = BigDecimal("200"),
                change = BigDecimal("50"),
                changePercent = BigDecimal("33.0"),
                dayHigh = BigDecimal("210"),
                dayLow = BigDecimal("185"),
                volume = 1500000L,
                lastUpdate = null
            )
        )

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, marketData)

        val sellRec = recommendations.find { it.type == RecommendationType.SELL_WARNING }
        assertNotNull(sellRec)
    }

    @Test
    fun `analyzeMarketOpportunities detects missing market data`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = listOf(createAsset("UNKNOWN", "STOCK")),
            totalInvested = BigDecimal("1000"),
            totalCurrentValue = BigDecimal("1100"),
            totalProfitLoss = BigDecimal("100"),
            profitLossPercentage = BigDecimal("10")
        )
        val riskMetrics = createSampleRiskMetrics()

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, emptyMap())

        val watchRec = recommendations.find { it.type == RecommendationType.WATCH_LIST && it.title.contains("Sem Dados") }
        assertNotNull(watchRec)
    }

    @Test
    fun `analyzeLiquidity detects low liquidity portfolio`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = listOf(
                createAsset("FII1", "FII"),
                createAsset("FII2", "FII"),
                createAsset("BOND1", "BOND")
            ),
            totalInvested = BigDecimal("10000"),
            totalCurrentValue = BigDecimal("11000"),
            totalProfitLoss = BigDecimal("1000"),
            profitLossPercentage = BigDecimal("10")
        )
        val riskMetrics = createSampleRiskMetrics()

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, emptyMap())

        val liquidityRec = recommendations.find { it.type == RecommendationType.INCREASE_LIQUIDITY }
        assertNotNull(liquidityRec)
    }

    @Test
    fun `recommendations are sorted by priority`() {
        val portfolio = createSamplePortfolio()
        val riskMetrics = createSampleRiskMetrics()

        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, emptyMap())

        val priorities = recommendations.map { it.priority }
        assertEquals(priorities.sorted(), priorities)
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