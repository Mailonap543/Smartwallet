from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, List


class RiskLevel(Enum):
    BAIXO = "baixo"
    MODERADO = "moderado"
    ALTO = "alto"


class EconomicScenario(Enum):
    INFLACAO_ALTA = "inflacao_alta"
    SELIC_ALTA = "selic_alta"
    DOLAR_FORTE = "dolar_forte"
    MERCADO_ESTAVEL = "mercado_estavel"


@dataclass
class MarketInsight:
    titulo: str
    descricao: str
    severidade: str
    recomendacao: str
    dados: Dict[str, float]
    timestamp: datetime


@dataclass
class EconomicContext:
    scenario: EconomicScenario
    inflacao: float
    selic: float
    dolar: float
    confianca: float


class MarketAnalyzer:
    def __init__(self):
        self.market_data_cache = {}

    def analyze_portfolio(self, risk_metrics: dict, score_metrics: dict, recommendations: list) -> List[MarketInsight]:
        insights = []
        insights.extend(self._analyze_risk(risk_metrics))
        insights.extend(self._analyze_diversification(score_metrics))
        insights.extend(self._analyze_performance(risk_metrics, score_metrics))
        insights.extend(self._analyze_liquidity(score_metrics))
        insights.extend(self._analyze_recommendations(recommendations))
        return sorted(insights, key=lambda item: self._severity_weight(item.severidade), reverse=True)

    def _analyze_risk(self, metrics: dict) -> List[MarketInsight]:
        insights = []
        volatility = self._number(metrics.get("portfolioVolatility"))
        risk_score = int(self._number(metrics.get("riskScore")))
        max_drawdown = self._number(metrics.get("maxDrawdown"))

        if volatility > 25 or risk_score >= 75:
            insights.append(
                MarketInsight(
                    titulo="Risco elevado",
                    descricao=f"Volatilidade de {volatility:.1f}% e score de risco {risk_score}/100.",
                    severidade="critical",
                    recomendacao="Reduza concentracao, revise ativos muito volateis e considere protecao de caixa.",
                    dados={"volatilidade": volatility, "riskScore": float(risk_score)},
                    timestamp=datetime.now(),
                )
            )
        elif volatility > 15 or max_drawdown > 12:
            insights.append(
                MarketInsight(
                    titulo="Risco em observacao",
                    descricao=f"Volatilidade de {volatility:.1f}% e drawdown maximo de {max_drawdown:.1f}%.",
                    severidade="warning",
                    recomendacao="Monitore a carteira e valide se o risco combina com seu horizonte.",
                    dados={"volatilidade": volatility, "maxDrawdown": max_drawdown},
                    timestamp=datetime.now(),
                )
            )

        return insights

    def _analyze_diversification(self, metrics: dict) -> List[MarketInsight]:
        insights = []
        diversification_score = int(self._number(metrics.get("diversificationScore")))
        concentration_score = int(self._number(metrics.get("concentrationScore")))

        if diversification_score < 35:
            insights.append(
                MarketInsight(
                    titulo="Diversificacao insuficiente",
                    descricao=f"Score de diversificacao: {diversification_score}/100.",
                    severidade="critical",
                    recomendacao="Espalhe o risco entre classes, setores e emissores diferentes.",
                    dados={"diversificationScore": float(diversification_score)},
                    timestamp=datetime.now(),
                )
            )
        elif concentration_score < 55:
            insights.append(
                MarketInsight(
                    titulo="Concentracao sensivel",
                    descricao=f"Score de concentracao: {concentration_score}/100.",
                    severidade="warning",
                    recomendacao="Evite que poucos ativos dominem o resultado da carteira.",
                    dados={"concentrationScore": float(concentration_score)},
                    timestamp=datetime.now(),
                )
            )

        return insights

    def _analyze_performance(self, risk_metrics: dict, score_metrics: dict) -> List[MarketInsight]:
        insights = []
        sharpe = self._number(risk_metrics.get("sharpeRatio"))
        risk_return_score = int(self._number(score_metrics.get("riskReturnScore")))

        if sharpe < 0.3 or risk_return_score < 45:
            insights.append(
                MarketInsight(
                    titulo="Retorno ajustado ao risco baixo",
                    descricao=f"Sharpe de {sharpe:.2f} e score risco-retorno {risk_return_score}/100.",
                    severidade="warning",
                    recomendacao="Compare o retorno esperado com alternativas mais simples e menos volateis.",
                    dados={"sharpeRatio": sharpe, "riskReturnScore": float(risk_return_score)},
                    timestamp=datetime.now(),
                )
            )

        return insights

    def _analyze_liquidity(self, metrics: dict) -> List[MarketInsight]:
        liquidity_score = int(self._number(metrics.get("liquidityScore")))
        if liquidity_score >= 40:
            return []

        return [
            MarketInsight(
                titulo="Liquidez baixa",
                descricao=f"Score de liquidez: {liquidity_score}/100.",
                severidade="warning",
                recomendacao="Mantenha uma parte da carteira em ativos de resgate mais simples.",
                dados={"liquidityScore": float(liquidity_score)},
                timestamp=datetime.now(),
            )
        ]

    def _analyze_recommendations(self, recommendations: list) -> List[MarketInsight]:
        urgent = [
            item for item in recommendations
            if isinstance(item, dict) and int(self._number(item.get("priority"))) <= 2
        ]

        if not urgent:
            return []

        return [
            MarketInsight(
                titulo="Acoes prioritarias detectadas",
                descricao=f"{len(urgent)} recomendacao(oes) aparecem como alta prioridade.",
                severidade="info",
                recomendacao="Revise primeiro as recomendacoes com maior impacto potencial.",
                dados={"count": float(len(urgent))},
                timestamp=datetime.now(),
            )
        ]

    def get_economic_context(self) -> EconomicContext:
        return EconomicContext(
            scenario=EconomicScenario.MERCADO_ESTAVEL,
            inflacao=4.5,
            selic=10.5,
            dolar=5.12,
            confianca=65,
        )

    def _severity_weight(self, severity: str) -> int:
        return {"critical": 3, "warning": 2, "info": 1}.get(severity, 0)

    def _number(self, value) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0
