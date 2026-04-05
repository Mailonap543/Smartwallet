package com.smartwallet.ai.service

import com.smartwallet.ai.model.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode

@Service
class RecommendationEngine {

    private val log = LoggerFactory.getLogger(RecommendationEngine::class.java)

    fun generateRecommendations(
        portfolio: PortfolioData,
        riskMetrics: RiskMetrics,
        marketData: Map<String, MarketData>
    ): List<Recommendation> {
        log.info("Generating recommendations for portfolio: ${portfolio.userId}")

        val recommendations = mutableListOf<Recommendation>()

        // Analyze diversification
        recommendations.addAll(analyzeDiversification(portfolio))

        // Analyze risk
        recommendations.addAll(analyzeRisk(portfolio, riskMetrics))

        // Analyze concentration
        recommendations.addAll(analyzeConcentration(portfolio))

        // Analyze market opportunities
        recommendations.addAll(analyzeMarketOpportunities(portfolio, marketData))

        // Analyze liquidity
        recommendations.addAll(analyzeLiquidity(portfolio))

        // Sort by priority
        return recommendations.sortedBy { it.priority }
    }

    private fun analyzeDiversification(portfolio: PortfolioData): List<Recommendation> {
        val recommendations = mutableListOf<Recommendation>()

        if (portfolio.assets.isEmpty()) return recommendations

        // Check asset type distribution
        val typeDistribution = portfolio.assets.groupBy { it.assetType }
        val typeCount = typeDistribution.size

        when {
            typeCount == 1 -> {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.DIVERSIFY,
                        title = "Falta de Diversificação",
                        description = "Sua carteira está concentrada em apenas um tipo de ativo. Considere diversificar para reduzir riscos.",
                        priority = 1,
                        potentialImpact = null,
                        actionRequired = "Adicionar ativos de diferentes classes (ações, FIIs, renda fixa)"
                    )
                )
            }
            typeCount == 2 -> {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.DIVERSIFY,
                        title = "Diversificação Limitada",
                        description = "Considere adicionar mais classes de ativos para melhorar a diversificação.",
                        priority = 3,
                        potentialImpact = null,
                        actionRequired = "Explorar outras classes como ETFs, commodities ou crypto"
                    )
                )
            }
        }

        // Check geographic diversification (simplified - would need actual data)
        val brazilianAssets = portfolio.assets.count { 
            it.symbol.endsWith("3") || it.symbol.endsWith("4") || it.symbol.endsWith("11")
        }
        if (brazilianAssets == portfolio.assets.size) {
            recommendations.add(
                Recommendation(
                    type = RecommendationType.DIVERSIFY,
                    title = "Concentração Geográfica",
                    description = "Todos os ativos são brasileiros. Considere exposição internacional para diversificação.",
                    priority = 4,
                    potentialImpact = null,
                    actionRequired = "Avaliar ETFs internacionais ou ADRs"
                )
            )
        }

        return recommendations
    }

    private fun analyzeRisk(portfolio: PortfolioData, riskMetrics: RiskMetrics): List<Recommendation> {
        val recommendations = mutableListOf<Recommendation>()

        when (riskMetrics.riskLevel) {
            RiskLevel.VERY_HIGH -> {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.REDUCE_RISK,
                        title = "Risco Muito Alto",
                        description = "Sua carteira apresenta nível de risco muito elevado. Considere rebalancear.",
                        priority = 1,
                        potentialImpact = riskMetrics.maxDrawdown,
                        actionRequired = "Reduzir exposição a ativos volatáteis e aumentar ativos de menor risco"
                    )
                )
            }
            RiskLevel.HIGH -> {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.REDUCE_RISK,
                        title = "Risco Alto",
                        description = "O nível de risco da carteira está elevado. Monitore de perto.",
                        priority = 2,
                        potentialImpact = riskMetrics.maxDrawdown,
                        actionRequired = "Considerar hedges ou ativos defensivos"
                    )
                )
            }
            RiskLevel.MODERATE -> {
                if (riskMetrics.sharpeRatio.toDouble() < 0.5) {
                    recommendations.add(
                        Recommendation(
                            type = RecommendationType.REBALANCE,
                            title = "Otimizar Retorno/Risco",
                            description = "Relação retorno/risco pode ser melhorada com rebalanceamento.",
                            priority = 5,
                            potentialImpact = null,
                            actionRequired = "Revisar alocação e considerar ativos com melhor Sharpe"
                        )
                    )
                }
            }
            else -> {}
        }

        // VaR warning
        if (riskMetrics.var95.toDouble() > 10) {
            recommendations.add(
                Recommendation(
                    type = RecommendationType.WATCH_LIST,
                    title = "Value at Risk Elevado",
                    description = "VaR de 95% indica perda potencial significativa no pior cenário.",
                    priority = 2,
                    potentialImpact = riskMetrics.var95,
                    actionRequired = "Preparar estratégia de stop-loss ou proteção"
                )
            )
        }

        return recommendations
    }

    private fun analyzeConcentration(portfolio: PortfolioData): List<Recommendation> {
        val recommendations = mutableListOf<Recommendation>()

        if (portfolio.assets.isEmpty() || portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) <= 0) {
            return recommendations
        }

        // Check single asset concentration
        val maxConcentration = portfolio.assets.maxOfOrNull { asset ->
            val value = asset.currentValue ?: BigDecimal.ZERO
            if (portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) > 0) {
                value.divide(portfolio.totalCurrentValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal(100))
            } else BigDecimal.ZERO
        } ?: BigDecimal.ZERO

        when {
            maxConcentration.toDouble() > 50 -> {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.DIVERSIFY,
                        title = "Concentração Excessiva",
                        description = "Um único ativo representa mais de 50% da carteira.",
                        priority = 1,
                        potentialImpact = null,
                        actionRequired = "Reduzir posição do ativo mais concentrado"
                    )
                )
            }
            maxConcentration.toDouble() > 30 -> {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.DIVERSIFY,
                        title = "Concentração Alta",
                        description = "Um ativo representa uma parte significativa da carteira.",
                        priority = 3,
                        potentialImpact = null,
                        actionRequired = "Monitorar e considerar diversificar"
                    )
                )
            }
        }

        // Top 3 concentration
        val top3Value = portfolio.assets.sortedByDescending { it.currentValue ?: BigDecimal.ZERO }
            .take(3)
            .sumOf { it.currentValue ?: BigDecimal.ZERO }

        val top3Percent = if (portfolio.totalCurrentValue.compareTo(BigDecimal.ZERO) > 0) {
            top3Value.divide(portfolio.totalCurrentValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal(100))
        } else BigDecimal.ZERO

        if (top3Percent.toDouble() > 80) {
            recommendations.add(
                Recommendation(
                    type = RecommendationType.DIVERSIFY,
                    title = "Concentração nos Top 3",
                    description = "Os 3 maiores ativos representam ${top3Percent.toInt()}% da carteira.",
                    priority = 2,
                    potentialImpact = null,
                    actionRequired = "Diversificar entre mais ativos"
                )
            )
        }

        return recommendations
    }

    private fun analyzeMarketOpportunities(
        portfolio: PortfolioData,
        marketData: Map<String, MarketData>
    ): List<Recommendation> {
        val recommendations = mutableListOf<Recommendation>()

        // Analyze each asset in portfolio
        for (asset in portfolio.assets) {
            val market = marketData[asset.symbol]

            if (market != null) {
                // Strong buy signal (significant drop)
                if (market.changePercent != null && market.changePercent.toDouble() < -10) {
                    recommendations.add(
                        Recommendation(
                            type = RecommendationType.BUY_OPPORTUNITY,
                            title = "Oportunidade de Compra: ${asset.symbol}",
                            description = "${asset.symbol} caiu ${market.changePercent.abs().toDouble()}%. Potencial de recuperação.",
                            priority = 4,
                            potentialImpact = market.changePercent.abs(),
                            actionRequired = "Avaliar compra adicional se alinhado com estratégia"
                        )
                    )
                }

                // Sell warning (significant gain)
                if (market.changePercent != null && market.changePercent.toDouble() > 20) {
                    recommendations.add(
                        Recommendation(
                            type = RecommendationType.SELL_WARNING,
                            title = "Ganho Significativo: ${asset.symbol}",
                            description = "${asset.symbol} subiu ${market.changePercent.toDouble()}%. Considere realizar lucro parcial.",
                            priority = 3,
                            potentialImpact = market.changePercent,
                            actionRequired = "Avaliar take profit ou stop trailing"
                        )
                    )
                }
            }

            // Check if asset has no market data (potential issue)
            if (market == null) {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.WATCH_LIST,
                        title = "Sem Dados de Mercado: ${asset.symbol}",
                        description = "${asset.symbol} não possui dados de mercado atualizados.",
                        priority = 6,
                        potentialImpact = null,
                        actionRequired = "Verificar se ativo ainda está ativo na B3"
                    )
                )
            }
        }

        return recommendations
    }

    private fun analyzeLiquidity(portfolio: PortfolioData): List<Recommendation> {
        val recommendations = mutableListOf<Recommendation>()

        // Illiquid assets analysis
        val illiquidTypes = listOf("FII", "BOND", "FUND")
        val illiquidValue = portfolio.assets
            .filter { illiquidTypes.contains(it.assetType) }
            .sumOf { it.currentValue ?: BigDecimal.ZERO }

        val totalValue = portfolio.totalCurrentValue

        if (totalValue.compareTo(BigDecimal.ZERO) > 0) {
            val illiquidPercent = illiquidValue
                .divide(totalValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal(100))

            if (illiquidPercent.toDouble() > 50) {
                recommendations.add(
                    Recommendation(
                        type = RecommendationType.INCREASE_LIQUIDITY,
                        title = "Liquidez Baixa",
                        description = "${illiquidPercent.toInt()}% da carteira está em ativos ilíquidos.",
                        priority = 3,
                        potentialImpact = null,
                        actionRequired = "Considerar aumentar posição em ativos mais líquidos"
                    )
                )
            }
        }

        return recommendations
    }
}