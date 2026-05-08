package com.smartwallet.ai.service

import com.smartwallet.ai.model.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode

@Service
class PortfolioScoringService {

    private val log = LoggerFactory.getLogger(PortfolioScoringService::class.java)

    fun calculateScore(
        portfolio: PortfolioData,
        riskMetrics: RiskMetrics,
        marketData: Map<String, MarketData>
    ): ScoreMetrics {
        log.info("Calculating portfolio score for user: ${portfolio.userId}")

        val diversificationScore = calculateDiversificationScore(portfolio)
        val riskReturnScore = calculateRiskReturnScore(riskMetrics)
        val liquidityScore = calculateLiquidityScore(portfolio)
        val concentrationScore = calculateConcentrationScore(portfolio)
        val stabilityScore = calculateStabilityScore(portfolio, riskMetrics)

        val overallScore = calculateOverallScore(
            diversificationScore,
            riskReturnScore,
            liquidityScore,
            concentrationScore,
            stabilityScore
        )

        val recommendations = generateImprovementRecommendations(
            diversificationScore,
            riskReturnScore,
            liquidityScore,
            concentrationScore,
            stabilityScore
        )

        log.info("Portfolio score calculated: $overallScore")

        return ScoreMetrics(
            overallScore = overallScore,
            diversificationScore = diversificationScore,
            riskReturnScore = riskReturnScore,
            liquidityScore = liquidityScore,
            concentrationScore = concentrationScore,
            stabilityScore = stabilityScore,
            recommendations = recommendations
        )
    }

    private fun calculateDiversificationScore(portfolio: PortfolioData): Int {
        if (portfolio.assets.isEmpty()) return 0
        if (portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) <= 0) return 0

        var score = 0

        // Asset type diversity (0-25 points)
        val typeCount = portfolio.assets.groupBy { it.assetType }.size
        score += when {
            typeCount >= 5 -> 25
            typeCount >= 4 -> 20
            typeCount >= 3 -> 15
            typeCount == 2 -> 10
            else -> 5
        }

        // Asset count (0-25 points)
        val assetCount = portfolio.assets.size
        score += when {
            assetCount >= 20 -> 25
            assetCount >= 15 -> 20
            assetCount >= 10 -> 15
            assetCount >= 5 -> 10
            else -> 5
        }

        return score.coerceIn(0, 50)
    }

    private fun calculateRiskReturnScore(riskMetrics: RiskMetrics): Int {
        var score = 50 // Base score

        // Sharpe ratio contribution (-20 to 20 points)
        val sharpe = riskMetrics.sharpeRatio.toDouble()
        score += when {
            sharpe >= 2.0 -> 20
            sharpe >= 1.5 -> 15
            sharpe >= 1.0 -> 10
            sharpe >= 0.5 -> 5
            sharpe > 0 -> 0
            else -> -10
        }

        // Beta contribution (-10 to 10 points)
        val beta = riskMetrics.beta.toDouble()
        score += when {
            beta < 0.7 -> 10
            beta < 0.9 -> 8
            beta < 1.1 -> 5
            beta < 1.3 -> 0
            else -> -10
        }

        // Volatility contribution (-20 to 10 points)
        val vol = riskMetrics.portfolioVolatility.toDouble()
        score += when {
            vol < 5 -> 10
            vol < 10 -> 5
            vol < 20 -> 0
            vol < 30 -> -10
            else -> -20
        }

        return score.coerceIn(0, 80)
    }

    private fun calculateLiquidityScore(portfolio: PortfolioData): Int {
        if (portfolio.assets.isEmpty()) return 0

        var score = 0

        // Liquid assets (stocks, crypto) vs illiquid (FIIs, bonds, funds)
        val liquidTypes = listOf("STOCK", "CRYPTO", "ETF", "COMMODITY")
        val illiquidTypes = listOf("FII", "BOND", "FUND")

        val liquidValue = portfolio.assets
            .filter { liquidTypes.contains(it.assetType) }
            .sumOf { it.currentValue ?: BigDecimal.ZERO }

        val illiquidValue = portfolio.assets
            .filter { illiquidTypes.contains(it.assetType) }
            .sumOf { it.currentValue ?: BigDecimal.ZERO }

        val totalValue = portfolio.totalCurrentValue

        if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
            val liquidPercent = liquidValue
                .divide(totalValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))

            score += when {
                liquidPercent.toDouble() >= 70 -> 40
                liquidPercent.toDouble() >= 50 -> 30
                liquidPercent.toDouble() >= 30 -> 20
                liquidPercent.toDouble() >= 10 -> 10
                else -> 0
            }

            // Illiquid penalty
            val illiquidPercent = illiquidValue
                .divide(totalValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))

            score += when {
                illiquidPercent.toDouble() <= 20 -> 10
                illiquidPercent.toDouble() <= 40 -> 5
                else -> 0
            }
        }

        return score.coerceIn(0, 50)
    }

    private fun calculateConcentrationScore(portfolio: PortfolioData): Int {
        if (portfolio.assets.isEmpty()) return 0
        if (portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) <= 0) return 0

        var score = 50 // Base score

        // Max single asset concentration
        val maxConcentration = portfolio.assets.maxOfOrNull { asset ->
            val value = asset.currentValue ?: BigDecimal.ZERO
            if (portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) > 0) {
                value.divide(portfolio.totalCurrentValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal(100)).toDouble()
            } else 0.0
        } ?: 0.0

        // Penalty for concentration
        score += when {
            maxConcentration <= 10 -> 25
            maxConcentration <= 20 -> 15
            maxConcentration <= 30 -> 5
            maxConcentration <= 50 -> -10
            else -> -25
        }

        // Top 3 concentration
        val top3Value = portfolio.assets.sortedByDescending { it.currentValue ?: BigDecimal.ZERO }
            .take(3)
            .sumOf { it.currentValue ?: BigDecimal.ZERO }

        val top3Percent = if (portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) > 0) {
            top3Value.divide(portfolio.totalCurrentValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal(100)).toDouble()
        } else 0.0

        score += when {
            top3Percent <= 40 -> 25
            top3Percent <= 60 -> 15
            top3Percent <= 75 -> 5
            else -> -15
        }

        return score.coerceIn(0, 100)
    }

    private fun calculateStabilityScore(portfolio: PortfolioData, riskMetrics: RiskMetrics): Int {
        var score = 50 // Base score

        // Max drawdown contribution
        val maxDrawdown = riskMetrics.maxDrawdown.toDouble()
        score += when {
            maxDrawdown <= 5 -> 20
            maxDrawdown <= 10 -> 15
            maxDrawdown <= 20 -> 5
            maxDrawdown <= 30 -> -5
            else -> -15
        }

        // Profit consistency
        val profitableAssets = portfolio.assets.count { 
            (it.profitLoss ?: BigDecimal.ZERO).compareTo(BigDecimal.ZERO) > 0 
        }
        val totalAssets = portfolio.assets.size

        if (totalAssets > 0) {
            val profitRatio = profitableAssets.toDouble() / totalAssets
            score += when {
                profitRatio >= 0.8 -> 20
                profitRatio >= 0.6 -> 15
                profitRatio >= 0.4 -> 5
                profitRatio >= 0.2 -> -5
                else -> -15
            }
        }

        // VaR contribution
        val var95 = riskMetrics.var95.toDouble()
        score += when {
            var95 <= 3 -> 10
            var95 <= 5 -> 5
            var95 <= 10 -> 0
            else -> -10
        }

        return score.coerceIn(0, 100)
    }

    private fun calculateOverallScore(
        diversification: Int,
        riskReturn: Int,
        liquidity: Int,
        concentration: Int,
        stability: Int
    ): Int {
        // Weighted average with focus on risk-adjusted returns
        val weights = mapOf(
            diversification to 0.20,
            riskReturn to 0.30,
            liquidity to 0.15,
            concentration to 0.15,
            stability to 0.20
        )

        val weightedSum = weights.entries.sumOf { (score, weight) ->
            score * weight
        }

        return weightedSum.toInt().coerceIn(0, 100)
    }

    private fun generateImprovementRecommendations(
        diversification: Int,
        riskReturn: Int,
        liquidity: Int,
        concentration: Int,
        stability: Int
    ): List<String> {
        val recommendations = mutableListOf<String>()

        if (diversification < 25) {
            recommendations.add("Adicione mais classes de ativos para diversificar melhor")
        }
        if (diversification < 40 && recommendations.size < 3) {
            recommendations.add("Aumente o número de ativos na carteira")
        }

        if (riskReturn < 40) {
            recommendations.add("Considere ativos com melhor relação retorno/risco")
        }

        if (liquidity < 25) {
            recommendations.add("Aumente a proporção de ativos líquidos")
        }

        if (concentration < 50) {
            recommendations.add("Reduza a concentração em poucos ativos")
        }

        if (stability < 40) {
            recommendations.add("Trabalhe para reduzir a volatilidade da carteira")
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Continue monitorando e rebalanceando periodicamente")
        }

        return recommendations.take(5)
    }
}