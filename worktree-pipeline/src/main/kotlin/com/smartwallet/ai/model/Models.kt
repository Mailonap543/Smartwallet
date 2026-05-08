package com.smartwallet.ai.model

import java.math.BigDecimal
import java.time.LocalDateTime

data class AssetData(
    val symbol: String,
    val name: String,
    val quantity: BigDecimal,
    val currentPrice: BigDecimal?,
    val averagePrice: BigDecimal?,
    val assetType: String,
    val currentValue: BigDecimal?,
    val profitLoss: BigDecimal?,
    val profitLossPercentage: BigDecimal?,
    val purchaseDate: java.time.LocalDate?
)

data class PortfolioData(
    val userId: Long,
    val assets: List<AssetData>,
    val totalInvested: BigDecimal,
    val totalCurrentValue: BigDecimal,
    val totalProfitLoss: BigDecimal,
    val profitLossPercentage: BigDecimal
)

data class MarketData(
    val symbol: String,
    val price: BigDecimal,
    val change: BigDecimal?,
    val changePercent: BigDecimal?,
    val dayHigh: BigDecimal?,
    val dayLow: BigDecimal?,
    val volume: Long?,
    val lastUpdate: LocalDateTime?
)

data class RiskMetrics(
    val portfolioVolatility: BigDecimal,
    val sharpeRatio: BigDecimal,
    val beta: BigDecimal,
    val maxDrawdown: BigDecimal,
    val var95: BigDecimal,
    val riskScore: Int,
    val riskLevel: RiskLevel
)

enum class RiskLevel {
    VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH
}

data class ScoreMetrics(
    val overallScore: Int,
    val diversificationScore: Int,
    val riskReturnScore: Int,
    val liquidityScore: Int,
    val concentrationScore: Int,
    val stabilityScore: Int,
    val recommendations: List<String>
)

data class Recommendation(
    val type: RecommendationType,
    val title: String,
    val description: String,
    val priority: Int,
    val potentialImpact: BigDecimal?,
    val actionRequired: String
)

enum class RecommendationType {
    DIVERSIFY, REDUCE_RISK, INCREASE_LIQUIDITY, REBALANCE, 
    BUY_OPPORTUNITY, SELL_WARNING, HOLD, WATCH_LIST
}

data class AnalysisResult(
    val riskMetrics: RiskMetrics,
    val score: ScoreMetrics,
    val recommendations: List<Recommendation>
)
