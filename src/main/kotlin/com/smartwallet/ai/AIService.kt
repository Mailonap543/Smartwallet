package com.smartwallet.ai

import com.smartwallet.ai.model.*
import com.smartwallet.ai.service.PortfolioScoringService
import com.smartwallet.ai.service.RecommendationEngine
import com.smartwallet.ai.service.RiskAnalysisService
import com.smartwallet.entity.Asset
import com.smartwallet.entity.Wallet
import com.smartwallet.service.market.MarketDataService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class AIService(
    private val riskAnalysisService: RiskAnalysisService,
    private val recommendationEngine: RecommendationEngine,
    private val portfolioScoringService: PortfolioScoringService,
    private val marketDataService: MarketDataService
) {

    private val log = LoggerFactory.getLogger(AIService::class.java)

    fun analyzePortfolio(userId: Long, wallets: List<Wallet>, assets: List<Asset>): AnalysisResult {
        log.info("Starting AI analysis for user: $userId")

        val portfolio = buildPortfolioData(wallets, assets)
        val marketData = fetchMarketData(assets)

        val riskMetrics = riskAnalysisService.analyzeRisk(portfolio, null)
        val recommendations = recommendationEngine.generateRecommendations(portfolio, riskMetrics, marketData)
        val score = portfolioScoringService.calculateScore(portfolio, riskMetrics, marketData)

        log.info("AI analysis completed. Score: ${score.overallScore}, Risk: ${riskMetrics.riskLevel}")

        return AnalysisResult(
            riskMetrics = riskMetrics,
            recommendations = recommendations,
            score = score,
            portfolioSummary = createSummary(portfolio)
        )
    }

    private fun buildPortfolioData(wallets: List<Wallet>, assets: List<Asset>): PortfolioData {
        val assetDataList = assets.map { asset ->
            AssetData(
                symbol = asset.symbol,
                name = asset.name,
                quantity = asset.quantity,
                currentPrice = asset.currentPrice,
                averagePrice = asset.averagePrice,
                assetType = asset.assetType?.name ?: "OTHER",
                currentValue = asset.currentValue,
                profitLoss = asset.profitLoss,
                profitLossPercentage = asset.profitLossPercentage,
                purchaseDate = asset.purchaseDate
            )
        }

        val totalInvested = assets.sumOf { it.totalInvested ?: BigDecimal.ZERO }
        val totalCurrentValue = assets.sumOf { it.currentValue ?: BigDecimal.ZERO }
        val totalProfitLoss = assets.sumOf { it.profitLoss ?: BigDecimal.ZERO }

        val profitLossPercent = if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            totalProfitLoss.divide(totalInvested, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))
        } else BigDecimal.ZERO

        return PortfolioData(
            userId = wallets.firstOrNull()?.user?.id ?: 0L,
            assets = assetDataList,
            totalInvested = totalInvested,
            totalCurrentValue = totalCurrentValue,
            totalProfitLoss = totalProfitLoss,
            profitLossPercentage = profitLossPercent
        )
    }

    private fun fetchMarketData(assets: List<Asset>): Map<String, com.smartwallet.ai.model.MarketData> {
        val symbols = assets.map { it.symbol }.distinct()
        return try {
            marketDataService.getQuotesAsMap(symbols).mapValues { (symbol, price) ->
                com.smartwallet.ai.model.MarketData(
                    symbol = symbol,
                    price = price,
                    change = null,
                    changePercent = null,
                    dayHigh = null,
                    dayLow = null,
                    volume = null,
                    lastUpdate = null
                )
            }
        } catch (e: Exception) {
            log.warn("Failed to fetch market data: ${e.message}")
            emptyMap()
        }
    }

    private fun createSummary(portfolio: PortfolioData): PortfolioSummary {
        return PortfolioSummary(
            totalAssets = portfolio.assets.size,
            totalValue = portfolio.totalCurrentValue,
            totalInvested = portfolio.totalInvested,
            profitLoss = portfolio.totalProfitLoss,
            assetTypes = portfolio.assets.groupBy { it.assetType }.mapValues { it.value.size }
        )
    }

    data class AnalysisResult(
        val riskMetrics: RiskMetrics,
        val recommendations: List<Recommendation>,
        val score: ScoreMetrics,
        val portfolioSummary: PortfolioSummary
    )

    data class PortfolioSummary(
        val totalAssets: Int,
        val totalValue: BigDecimal,
        val totalInvested: BigDecimal,
        val profitLoss: BigDecimal,
        val assetTypes: Map<String, Int>
    )
}