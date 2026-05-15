package com.smartwallet.ai.service

import com.smartwallet.ai.model.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.LocalDate

class RiskAnalysisServiceTest {

    private lateinit var riskAnalysisService: RiskAnalysisService

    @BeforeEach
    fun setup() {
        riskAnalysisService = RiskAnalysisService()
    }

    @Test
    fun `analyzeRisk returns metrics for valid portfolio`() {
        val portfolio = createSamplePortfolio()
        val metrics = riskAnalysisService.analyzeRisk(portfolio, null)

        assertNotNull(metrics)
        assertTrue(metrics.riskScore in 0..100)
        assertNotNull(metrics.riskLevel)
    }

    @Test
    fun `analyzeRisk handles empty portfolio`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = emptyList(),
            totalInvested = BigDecimal.ZERO,
            totalCurrentValue = BigDecimal.ZERO,
            totalProfitLoss = BigDecimal.ZERO,
            profitLossPercentage = BigDecimal.ZERO
        )

        val metrics = riskAnalysisService.analyzeRisk(portfolio, null)

        assertEquals(0, metrics.portfolioVolatility.toDouble())
        assertEquals(0, metrics.sharpeRatio.toDouble())
        assertEquals(BigDecimal.ONE, metrics.beta)
    }

    @Test
    fun `analyzeRisk determines correct risk level from score`() {
        val portfolio = createSamplePortfolio()
        val metrics = riskAnalysisService.analyzeRisk(portfolio, null)

        when {
            metrics.riskScore < 20 -> assertEquals(RiskLevel.VERY_LOW, metrics.riskLevel)
            metrics.riskScore < 40 -> assertEquals(RiskLevel.LOW, metrics.riskLevel)
            metrics.riskScore < 60 -> assertEquals(RiskLevel.MODERATE, metrics.riskLevel)
            metrics.riskScore < 80 -> assertEquals(RiskLevel.HIGH, metrics.riskLevel)
            else -> assertEquals(RiskLevel.VERY_HIGH, metrics.riskLevel)
        }
    }

    @Test
    fun `calculateMaxDrawdown returns zero for empty returns`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = emptyList(),
            totalInvested = BigDecimal.ONE,
            totalCurrentValue = BigDecimal.ONE,
            totalProfitLoss = BigDecimal.ZERO,
            profitLossPercentage = BigDecimal.ZERO
        )

        val metrics = riskAnalysisService.analyzeRisk(portfolio, null)

        assertEquals(BigDecimal.ZERO, metrics.maxDrawdown)
    }

    @Test
    fun `calculateVaR95 handles single return`() {
        val portfolio = PortfolioData(
            userId = 1L,
            assets = emptyList(),
            totalInvested = BigDecimal.TEN,
            totalCurrentValue = BigDecimal.TEN,
            totalProfitLoss = BigDecimal.ONE,
            profitLossPercentage = BigDecimal.valueOf(10)
        )

        val metrics = riskAnalysisService.analyzeRisk(portfolio, null)

        assertNotNull(metrics.var95)
    }

    private fun createSamplePortfolio(): PortfolioData {
        return PortfolioData(
            userId = 1L,
            assets = listOf(
                AssetData(
                    symbol = "AAPL",
                    name = "Apple",
                    quantity = BigDecimal("10"),
                    currentPrice = BigDecimal("150.00"),
                    averagePrice = BigDecimal("140.00"),
                    assetType = "STOCK",
                    currentValue = BigDecimal("1500.00"),
                    profitLoss = BigDecimal("100.00"),
                    profitLossPercentage = BigDecimal("7.14"),
                    purchaseDate = LocalDate.now().minusMonths(6)
                ),
                AssetData(
                    symbol = "GOOGL",
                    name = "Google",
                    quantity = BigDecimal("5"),
                    currentPrice = BigDecimal("2800.00"),
                    averagePrice = BigDecimal("2700.00"),
                    assetType = "STOCK",
                    currentValue = BigDecimal("14000.00"),
                    profitLoss = BigDecimal("500.00"),
                    profitLossPercentage = BigDecimal("3.70"),
                    purchaseDate = LocalDate.now().minusMonths(3)
                ),
                AssetData(
                    symbol = "BTC",
                    name = "Bitcoin",
                    quantity = BigDecimal("0.5"),
                    currentPrice = BigDecimal("60000.00"),
                    averagePrice = BigDecimal("55000.00"),
                    assetType = "CRYPTO",
                    currentValue = BigDecimal("30000.00"),
                    profitLoss = BigDecimal("2500.00"),
                    profitLossPercentage = BigDecimal("8.33"),
                    purchaseDate = LocalDate.now().minusMonths(1)
                )
            ),
            totalInvested = BigDecimal("50000.00"),
            totalCurrentValue = BigDecimal("45500.00"),
            totalProfitLoss = BigDecimal("3600.00"),
            profitLossPercentage = BigDecimal("7.20")
        )
    }
}