package com.smartwallet.ai.service

import com.smartwallet.ai.model.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.sqrt

@Service
class RiskAnalysisService {

    private val log = LoggerFactory.getLogger(RiskAnalysisService::class.java)

    fun analyzeRisk(portfolio: PortfolioData, historicalData: Map<String, List<BigDecimal>>?): RiskMetrics {
        log.info("Starting risk analysis for portfolio: ${portfolio.userId}")

        val returns = calculatePortfolioReturns(portfolio)
        val volatility = calculateVolatility(returns)
        val sharpe = calculateSharpeRatio(returns, volatility)
        val beta = estimateBeta(returns, historicalData)
        val maxDrawdown = calculateMaxDrawdown(returns)
        val var95 = calculateVaR95(returns)
        
        val riskScore = calculateRiskScore(volatility, sharpe, maxDrawdown, beta)
        val riskLevel = determineRiskLevel(riskScore)

        log.info("Risk analysis completed. Risk score: $riskScore, Level: $riskLevel")

        return RiskMetrics(
            portfolioVolatility = volatility,
            sharpeRatio = sharpe,
            beta = beta,
            maxDrawdown = maxDrawdown,
            var95 = var95,
            riskScore = riskScore,
            riskLevel = riskLevel
        )
    }

    private fun calculatePortfolioReturns(portfolio: PortfolioData): List<BigDecimal> {
        if (portfolio.totalInvested.compareTo(BigDecimal.ZERO) <= 0) {
            return emptyList()
        }

        val dailyReturn = if (portfolio.totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            portfolio.totalProfitLoss.divide(portfolio.totalInvested, 6, RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        return listOf(dailyReturn)
    }

    private fun calculateVolatility(returns: List<BigDecimal>): BigDecimal {
        if (returns.size < 2) return BigDecimal.ZERO

        val mean = returns.reduce(BigDecimal::add).divide(
            BigDecimal.valueOf(returns.size.toLong()), 6, RoundingMode.HALF_UP
        )

        val squaredDiffs = returns.map { (it.subtract(mean)).pow(2) }
        val variance = squaredDiffs.reduce(BigDecimal::add).divide(
            BigDecimal.valueOf((returns.size - 1).toLong()), 6, RoundingMode.HALF_UP
        )

        return sqrt(variance.toDouble()).toBigDecimal().multiply(BigDecimal.valueOf(100))
            .setScale(2, RoundingMode.HALF_UP)
    }

    private fun calculateSharpeRatio(returns: List<BigDecimal>, volatility: BigDecimal): BigDecimal {
        if (volatility.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO

        val riskFreeRate = BigDecimal.valueOf(0.12) // 12% annual for Brazil
        val meanReturn = if (returns.isNotEmpty()) {
            returns.reduce(BigDecimal::add).divide(
                BigDecimal.valueOf(returns.size.toLong()), 6, RoundingMode.HALF_UP
            ).multiply(BigDecimal.valueOf(252)) // Annualized
        } else BigDecimal.ZERO

        val excessReturn = meanReturn.subtract(riskFreeRate)
        val annualizedVol = volatility.multiply(BigDecimal.valueOf(100))

        return if (annualizedVol.compareTo(BigDecimal.ZERO) > 0) {
            excessReturn.divide(annualizedVol, 2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO
    }

    private fun estimateBeta(returns: List<BigDecimal>, marketData: Map<String, List<BigDecimal>>?): BigDecimal {
        if (marketData == null || marketData.isNullOrEmpty()) {
            return BigDecimal.valueOf(1.0) // Default market beta
        }

        val portfolioVariance = calculateVariance(returns)
        if (portfolioVariance.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ONE

        return BigDecimal.ONE // Simplified - would need market returns for proper calculation
    }

    private fun calculateMaxDrawdown(returns: List<BigDecimal>): BigDecimal {
        if (returns.isEmpty()) return BigDecimal.ZERO

        var peak = BigDecimal.ZERO
        var maxDrawdown = BigDecimal.ZERO

        for (returnValue in returns) {
            if (returnValue.compareTo(peak) > 0) {
                peak = returnValue
            }
            val drawdown = if (peak.compareTo(BigDecimal.ZERO) > 0) {
                peak.subtract(returnValue).divide(peak, 4, RoundingMode.HALF_UP)
            } else BigDecimal.ZERO

            if (drawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = drawdown
            }
        }

        return maxDrawdown.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
    }

    private fun calculateVaR95(returns: List<BigDecimal>): BigDecimal {
        if (returns.isEmpty()) return BigDecimal.ZERO

        val sorted = returns.sorted()
        val index = ((sorted.size * 0.05).toInt()).coerceAtLeast(0)
        
        return if (index < sorted.size) {
            sorted[index].abs().multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
        } else BigDecimal.ZERO
    }

    private fun calculateRiskScore(
        volatility: BigDecimal, 
        sharpe: BigDecimal, 
        maxDrawdown: BigDecimal,
        beta: BigDecimal
    ): Int {
        var score = 50

        // Volatility contribution (0-25 points)
        val volScore = when {
            volatility.toDouble() < 5 -> 0
            volatility.toDouble() < 15 -> 10
            volatility.toDouble() < 25 -> 15
            else -> 25
        }
        score += volScore

        // Sharpe ratio contribution (-15 to 15 points)
        val sharpeScore = when {
            sharpe.toDouble() > 2 -> -15
            sharpe.toDouble() > 1 -> -10
            sharpe.toDouble() > 0 -> -5
            else -> 10
        }
        score += sharpeScore

        // Max drawdown contribution (0-20 points)
        val ddScore = when {
            maxDrawdown.toDouble() < 5 -> 0
            maxDrawdown.toDouble() < 10 -> 5
            maxDrawdown.toDouble() < 20 -> 10
            else -> 20
        }
        score += ddScore

        // Beta contribution (0-20 points)
        val betaScore = when {
            beta.toDouble() < 0.8 -> 0
            beta.toDouble() < 1.2 -> 10
            beta.toDouble() < 1.5 -> 15
            else -> 20
        }
        score += betaScore

        return score.coerceIn(0, 100)
    }

    private fun determineRiskLevel(score: Int): RiskLevel {
        return when {
            score < 20 -> RiskLevel.VERY_LOW
            score < 40 -> RiskLevel.LOW
            score < 60 -> RiskLevel.MODERATE
            score < 80 -> RiskLevel.HIGH
            else -> RiskLevel.VERY_HIGH
        }
    }

    private fun calculateVariance(returns: List<BigDecimal>): BigDecimal {
        if (returns.size < 2) return BigDecimal.ZERO

        val mean = returns.reduce(BigDecimal::add).divide(
            BigDecimal.valueOf(returns.size.toLong()), 6, RoundingMode.HALF_UP
        )

        val squaredDiffs = returns.map { (it.subtract(mean)).pow(2) }
        return squaredDiffs.reduce(BigDecimal::add).divide(
            BigDecimal.valueOf((returns.size - 1).toLong()), 6, RoundingMode.HALF_UP
        )
    }

    private fun BigDecimal.pow(n: Int): BigDecimal {
        var result = BigDecimal.ONE
        repeat(n) { result = result.multiply(this) }
        return result
    }
}