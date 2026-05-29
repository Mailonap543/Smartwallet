from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import re
from typing import Any, Dict, List, Tuple


class IntentType(Enum):
    COMPRA = "compra"
    VENDA = "venda"
    ANALISE = "analise"
    ALERTA = "alerta"
    REBALANCEAMENTO = "rebalanceamento"
    EDUCACIONAL = "educacional"
    RISCO = "risco"
    OPORTUNIDADE = "oportunidade"
    RESUMO = "resumo"
    TEMPO = "tempo"
    AJUDA = "ajuda"
    BUSCA_WEB = "busca_web"
    SISTEMA = "sistema"


class SentimentType(Enum):
    OTIMISTA = "otimista"
    PESSIMISTA = "pessimista"
    NEUTRO = "neutro"


@dataclass
class ParsedMessage:
    intent: IntentType
    confidence: float
    sentiment: SentimentType
    entities: Dict[str, Any]
    keywords: List[str]
    priority: int
    timestamp: datetime


class JarvisNLPParser:
    def __init__(self):
        self.intent_keywords = {
            IntentType.AJUDA: ["ajuda", "comandos", "o que voce faz", "como usar", "capacidades"],
            IntentType.TEMPO: ["hora", "horario", "data", "dia de hoje", "que dia"],
            IntentType.RESUMO: ["resumo", "status", "panorama", "visao geral", "carteira"],
            IntentType.COMPRA: ["comprar", "compra", "investir", "alocar", "aporte", "entrada"],
            IntentType.VENDA: ["vender", "venda", "sair", "reduzir", "desfazer", "realizar lucro"],
            IntentType.ANALISE: ["analisar", "analise", "como esta", "qual", "avaliar", "fundamentos"],
            IntentType.ALERTA: ["alerta", "cuidado", "atencao", "avisar", "monitorar"],
            IntentType.REBALANCEAMENTO: ["rebalancear", "rebalanceamento", "balancear", "realocar"],
            IntentType.RISCO: ["risco", "volatilidade", "drawdown", "var", "beta", "sharpe"],
            IntentType.OPORTUNIDADE: ["oportunidade", "chance", "potencial", "barato", "desconto"],
            IntentType.BUSCA_WEB: ["pesquisar", "google", "noticia", "noticias", "cotacao", "hoje", "agora"],
            IntentType.SISTEMA: ["screenshot", "print", "desligar", "reiniciar", "abrir programa", "tocar musica"],
        }

    def parse(self, message: str, context: Dict[str, Any]) -> ParsedMessage:
        message_lower = message.lower().strip()
        intent, confidence = self._detect_intent(message_lower)
        sentiment = self._analyze_sentiment(message_lower)
        entities = self._extract_entities(message, context)
        keywords = self._extract_keywords(message_lower)
        priority = self._calculate_priority(intent, context, entities)

        return ParsedMessage(
            intent=intent,
            confidence=confidence,
            sentiment=sentiment,
            entities=entities,
            keywords=keywords,
            priority=priority,
            timestamp=datetime.now(),
        )

    def _detect_intent(self, message: str) -> Tuple[IntentType, float]:
        max_score = 0
        detected_intent = IntentType.EDUCACIONAL

        for intent_type, keywords in self.intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message)
            if score > max_score:
                max_score = score
                detected_intent = intent_type

        if detected_intent == IntentType.EDUCACIONAL and self._find_tickers(message):
            detected_intent = IntentType.ANALISE
            max_score = 1

        confidence = min(0.95, 0.45 + (max_score * 0.18))
        return detected_intent, confidence

    def _analyze_sentiment(self, message: str) -> SentimentType:
        positive = ["crescimento", "alta", "ganho", "lucro", "oportunidade", "bom", "melhor"]
        negative = ["queda", "baixa", "perda", "risco", "problema", "ruim", "prejuizo"]
        pos_count = sum(1 for word in positive if word in message)
        neg_count = sum(1 for word in negative if word in message)

        if pos_count > neg_count:
            return SentimentType.OTIMISTA
        if neg_count > pos_count:
            return SentimentType.PESSIMISTA
        return SentimentType.NEUTRO

    def _extract_entities(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "ativos": self._find_assets(message, context),
            "tickers": self._find_tickers(message),
            "valores": self._find_values(message),
            "prazos": self._find_timeframes(message),
            "metricas": self._find_metrics(message),
        }

    def _extract_keywords(self, message: str) -> List[str]:
        stopwords = {
            "para",
            "com",
            "uma",
            "que",
            "qual",
            "como",
            "meu",
            "minha",
            "voce",
            "sobre",
            "dos",
            "das",
        }
        words = re.findall(r"[\w$.,%-]+", message)
        return [word for word in words if len(word) > 3 and word not in stopwords][:10]

    def _find_assets(self, message: str, context: Dict[str, Any]) -> List[str]:
        known_assets = ["ipca", "selic", "dolar", "tesouro", "fii", "fundo", "acoes", "bdr"]
        found = [asset for asset in known_assets if asset in message.lower()]

        context_assets = context.get("assets", [])
        if isinstance(context_assets, list):
            lower_message = message.lower()
            for asset in context_assets:
                if isinstance(asset, str) and asset.lower() in lower_message:
                    found.append(asset)

        return sorted(set(found))

    def _find_tickers(self, message: str) -> List[str]:
        return sorted(set(re.findall(r"\b[A-Z]{4}\d{1,2}\b", message.upper())))

    def _find_values(self, message: str) -> List[float]:
        values = []
        money_pattern = (
            r"R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)"
            r"|(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)\s*(?:reais|brl)"
        )

        for match in re.findall(money_pattern, message, flags=re.IGNORECASE):
            raw_value = next((part for part in match if part), "")
            normalized = raw_value.replace(".", "").replace(",", ".")
            try:
                values.append(float(normalized))
            except ValueError:
                continue

        return values[:5]

    def _find_timeframes(self, message: str) -> List[str]:
        timeframes = ["curto prazo", "medio prazo", "longo prazo", "hoje", "semana", "mes", "ano"]
        lower_message = message.lower()
        return [timeframe for timeframe in timeframes if timeframe in lower_message]

    def _find_metrics(self, message: str) -> List[str]:
        metrics = ["sharpe", "beta", "volatilidade", "drawdown", "var", "score", "liquidez"]
        lower_message = message.lower()
        return [metric for metric in metrics if metric in lower_message]

    def _calculate_priority(self, intent: IntentType, context: Dict[str, Any], entities: Dict[str, Any]) -> int:
        priority = 5
        risk_level = str(context.get("riskLevel") or context.get("risk_level") or "").upper()
        risk_score = int(context.get("riskScore") or context.get("risk_score") or 0)

        if intent == IntentType.ALERTA:
            priority = 10
        elif intent == IntentType.RISCO and (risk_level in {"HIGH", "VERY_HIGH", "ALTO"} or risk_score >= 70):
            priority = 9
        elif intent == IntentType.VENDA and risk_score >= 70:
            priority = 8
        elif intent == IntentType.OPORTUNIDADE:
            priority = 7
        elif entities.get("tickers"):
            priority = 6

        return min(10, priority)
