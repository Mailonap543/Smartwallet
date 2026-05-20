package com.smartwallet.ai

import com.smartwallet.ai.model.*
import com.smartwallet.ai.service.PortfolioScoringService
import com.smartwallet.ai.service.RecommendationEngine
import com.smartwallet.ai.service.RiskAnalysisService
import com.smartwallet.entity.AssetType
import com.smartwallet.entity.Asset
import com.smartwallet.entity.Wallet
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode

import java.time.LocalDateTime

@Service
class AIService(
    private val riskAnalysisService: RiskAnalysisService,
    private val portfolioScoringService: PortfolioScoringService,
    private val recommendationEngine: RecommendationEngine
) {

    private val log = LoggerFactory.getLogger(AIService::class.java)


    data class AnalysisResult(
        val riskMetrics: RiskMetrics,
        val score: ScoreMetrics,
        val recommendations: List<Recommendation>
    )

    fun analyzePortfolio(userId: Long): Map<String, Any> {
        log.info("Starting AI analysis for user: $userId")

        return mapOf(
            "status" to "analyzed",
            "riskMetrics" to mapOf(
                "riskScore" to 50,
                "riskLevel" to "MODERATE"
            ),
            "recommendations" to listOf<String>(),
            "score" to mapOf(
                "overallScore" to 75
            )
        )
    }

    fun analyzePortfolio(
        userId: Long,
        wallets: List<Wallet>,
        assets: List<Asset>
    ): AnalysisResult {
        log.info("AI analysis (detailed) for user: $userId wallets=${wallets.size} assets=${assets.size}")

        val portfolio = toPortfolioData(userId, wallets, assets)
        val riskMetrics = riskAnalysisService.analyzeRisk(portfolio, historicalData = null)
        val marketData = toMarketData(assets)
        val scoreMetrics = portfolioScoringService.calculateScore(
            portfolio = portfolio,
            riskMetrics = riskMetrics,
            marketData = marketData
        )

        val generatedRecommendations = recommendationEngine.generateRecommendations(
            portfolio = portfolio,
            riskMetrics = riskMetrics,
            marketData = marketData
        )


        val finalRecommendations = if (generatedRecommendations.isNotEmpty()) {
            generatedRecommendations
        } else {
            listOf(
                Recommendation(
                    type = RecommendationType.HOLD,
                    title = "Continue acompanhando",
                    description = "Sua carteira estÃ¡ dentro de um cenÃ¡rio estÃ¡vel; mantenha o monitoramento e reavalie periodicamente.",
                    priority = 999,
                    potentialImpact = null,
                    actionRequired = "Rebalancear e revisar objetivos a cada trimestre"
                )
            )
        }

        return AnalysisResult(
            riskMetrics = riskMetrics,
            score = scoreMetrics,
            recommendations = finalRecommendations
        )
    }

    fun getRecommendations(): List<Map<String, Any>> {
        return listOf(
            mapOf(
                "type" to "BUY",
                "title" to "Diversifique seus investimentos",
                "description" to "Considere adicionar investimentos de renda fixa para equilibrar seu portfÃ³lio",
                "priority" to 1
            )
        )
    }

    fun calculateScore(): Int {
        return 75
    }

    private fun toPortfolioData(
        userId: Long,
        wallets: List<Wallet>,
        assets: List<Asset>
    ): PortfolioData {
        val assetData = assets.map(::toAssetData)

        val totalsFromWallets = wallets.fold(
            Triple(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)
        ) { acc, wallet ->
            Triple(
                acc.first + (wallet.totalInvested ?: BigDecimal.ZERO),
                acc.second + (wallet.totalBalance ?: BigDecimal.ZERO),
                acc.third + (wallet.totalProfitLoss ?: BigDecimal.ZERO)
            )
        }

        val totalsFromAssets = assets.fold(
            Triple(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)
        ) { acc, asset ->
            Triple(
                acc.first + (asset.getTotalInvested() ?: BigDecimal.ZERO),
                acc.second + (asset.getCurrentValue() ?: BigDecimal.ZERO),
                acc.third + (asset.getProfitLoss() ?: BigDecimal.ZERO)
            )
        }


        val totalInvested = if (totalsFromWallets.first > BigDecimal.ZERO) totalsFromWallets.first else totalsFromAssets.first
        val totalCurrentValue = if (totalsFromWallets.second > BigDecimal.ZERO) totalsFromWallets.second else totalsFromAssets.second
        val totalProfitLoss = if (totalsFromWallets.third != BigDecimal.ZERO) totalsFromWallets.third else totalsFromAssets.third

        val profitLossPercentage = if (totalInvested > BigDecimal.ZERO) {
            totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
        } else {
            BigDecimal.ZERO
        }

        return PortfolioData(
            userId = userId,
            assets = assetData,
            totalInvested = totalInvested,
            totalCurrentValue = totalCurrentValue,
            totalProfitLoss = totalProfitLoss,
            profitLossPercentage = profitLossPercentage
        )
    }

     private fun toAssetData(asset: Asset): AssetData {
         return AssetData(
             symbol = asset.symbol,
             name = asset.name ?: asset.symbol,
             quantity = asset.quantity ?: BigDecimal.ZERO,
             currentPrice = asset.currentPrice,
             averagePrice = asset.averagePrice,
             assetType = mapAssetType(asset.assetType),
             currentValue = asset.currentValue,
             profitLoss = asset.profitLoss,
             profitLossPercentage = asset.profitLossPercentage,
             purchaseDate = asset.purchaseDate
         )
     }

    private fun mapAssetType(type: AssetType?): String {
        return when (type) {
            null -> "OTHER"
            AssetType.REIT -> "FII"
            AssetType.CASH -> "CASH"
            else -> type.name
        }
    }

    private fun toMarketData(assets: List<Asset>): Map<String, MarketData> {


        val now = LocalDateTime.now()
        return assets.associate { asset ->
            val symbol = asset.getSymbol()
            val price = asset.getCurrentPrice() ?: asset.getCurrentValue() ?: asset.getPurchasePrice() ?: BigDecimal.ZERO
            symbol to MarketData(
                symbol = symbol,
                price = price,
                change = null,
                changePercent = null,
                dayHigh = asset.getDayHigh(),
                dayLow = asset.getDayLow(),
                volume = asset.getDayVolume(),
                lastUpdate = now
            )
        }
    }
}

