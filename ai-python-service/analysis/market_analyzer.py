from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime

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
        return sorted(insights, key=lambda x: x.severidade == "critical", reverse=True)

    def _analyze_risk(self, metrics: dict) -> List[MarketInsight]:
        insights = []
        volatility = metrics.get("portfolioVolatility", 0)
        
        if volatility > 25:
            insights.append(MarketInsight(
                titulo="Volatilidade Elevada",
                descricao=f"Sua carteira tem volatilidade de {volatility:.1f}%",
                severidade="critical",
                recomendacao="Aumente diversificação",
                dados={"volatilidade": volatility},
                timestamp=datetime.now()
            ))
        return insights

    def _analyze_diversification(self, metrics: dict) -> List[MarketInsight]:
        insights = []
        div_score = metrics.get("diversificationScore", 0)
        
        if div_score < 30:
            insights.append(MarketInsight(
                titulo="Diversificação Insuficiente",
                descricao=f"Score: {div_score}/100",
                severidade="critical",
                recomendacao="Expanda para novas classes de ativos",
                dados={"diversificationScore": div_score},
                timestamp=datetime.now()
            ))
        return insights

    def _analyze_performance(self, risk_metrics: dict, score_metrics: dict) -> List[MarketInsight]:
        insights = []
        sharpe = risk_metrics.get("sharpeRatio", 0)
        
        if sharpe < 0.3:
            insights.append(MarketInsight(
                titulo="Sharpe Ratio Baixo",
                descricao=f"Ratio: {sharpe:.2f}",
                severidade="critical",
                recomendacao="Revise seleção de ativos",
                dados={"sharpeRatio": sharpe},
                timestamp=datetime.now()
            ))
        return insights

    def get_economic_context(self) -> EconomicContext:
        return EconomicContext(
            scenario=EconomicScenario.MERCADO_ESTAVEL,
            inflacao=4.5,
            selic=10.5,
            dolar=5.12,
            confianca=65
        )
