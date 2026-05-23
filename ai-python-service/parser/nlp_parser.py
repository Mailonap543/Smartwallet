from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional
import re
from datetime import datetime

class IntentType(Enum):
    COMPRA = "compra"
    VENDA = "venda"
    ANALISE = "analise"
    ALERTA = "alerta"
    REBALANCEAMENTO = "rebalanceamento"
    EDUCACIONAL = "educacional"
    RISCO = "risco"
    OPORTUNIDADE = "oportunidade"

class SentimentType(Enum):
    OTIMISTA = "otimista"
    PESSIMISTA = "pessimista"
    NEUTRO = "neutro"

@dataclass
class ParsedMessage:
    intent: IntentType
    confidence: float
    sentiment: SentimentType
    entities: Dict[str, any]
    keywords: List[str]
    priority: int
    timestamp: datetime

class JarvisNLPParser:
    def __init__(self):
        self.intent_keywords = {
            IntentType.COMPRA: ["comprar", "compra", "investir", "alocar"],
            IntentType.VENDA: ["vender", "venda", "sair", "reduzir"],
            IntentType.ANALISE: ["analisar", "análise", "como", "qual"],
            IntentType.ALERTA: ["alerta", "cuidado", "atenção", "risco alto"],
            IntentType.RISCO: ["risco", "volatilidade", "drawdown"],
            IntentType.OPORTUNIDADE: ["oportunidade", "chance", "potencial"]
        }

    def parse(self, message: str, context: dict) -> ParsedMessage:
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
            timestamp=datetime.now()
        )

    def _detect_intent(self, message: str) -> tuple:
        max_score = 0
        detected_intent = IntentType.EDUCACIONAL
        for intent_type, keywords in self.intent_keywords.items():
            score = sum(1 for kw in keywords if kw in message)
            if score > max_score:
                max_score = score
                detected_intent = intent_type
        confidence = min(0.95, 0.5 + (max_score * 0.2))
        return detected_intent, confidence

    def _analyze_sentiment(self, message: str) -> SentimentType:
        positive = ["crescimento", "alta", "ganho", "lucro", "oportunidade"]
        negative = ["queda", "baixa", "perda", "risco", "problema"]
        pos_count = sum(1 for word in positive if word in message)
        neg_count = sum(1 for word in negative if word in message)
        if pos_count > neg_count:
            return SentimentType.OTIMISTA
        elif neg_count > pos_count:
            return SentimentType.PESSIMISTA
        return SentimentType.NEUTRO

    def _extract_entities(self, message: str, context: dict) -> Dict:
        return {
            "ativos": self._find_assets(message),
            "valores": self._find_values(message),
            "prazos": self._find_timeframes(message),
            "metricas": self._find_metrics(message)
        }

    def _extract_keywords(self, message: str) -> List[str]:
        stopwords = {"o", "a", "de", "para", "com", "em"}
        words = message.split()
        return [w for w in words if len(w) > 3 and w not in stopwords][:10]

    def _find_assets(self, message: str) -> List[str]:
        assets = ["ipca", "selic", "dólar", "tesouro", "fundo"]
        return [a for a in assets if a in message.lower()]

    def _find_values(self, message: str) -> List[float]:
        pattern = r'R\$\s*([\d.,]+)'
        matches = re.findall(pattern, message)
        return [float(m.replace(".", "").replace(",", ".")) for m in matches]

    def _find_timeframes(self, message: str) -> List[str]:
        timeframes = ["curto prazo", "médio prazo", "longo prazo"]
        return [t for t in timeframes if t in message.lower()]

    def _find_metrics(self, message: str) -> List[str]:
        metrics = ["sharpe", "beta", "volatilidade", "drawdown", "var"]
        return [m for m in metrics if m in message.lower()]

    def _calculate_priority(self, intent: IntentType, context: dict, entities: dict) -> int:
        priority = 5
        if intent == IntentType.ALERTA:
            priority = 10
        elif intent == IntentType.RISCO and context.get("riskLevel") == "ALTO":
            priority = 9
        elif intent == IntentType.OPORTUNIDADE:
            priority = 7
        return min(10, priority)
