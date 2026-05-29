from __future__ import annotations

import os
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel

from analysis.market_analyzer import MarketAnalyzer, MarketInsight
from memory.conversation_memory import ConversationMemory
from parser.nlp_parser import IntentType, JarvisNLPParser, ParsedMessage

try:
    from dotenv import load_dotenv

    load_dotenv(override=True)
except ImportError:
    pass

try:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage

    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

# Import real-time data service
from enhanced_realtime_data_service import enhanced_realtime_data_service


def get_int_env(name: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return max(minimum, min(maximum, value))


app = FastAPI(title="SmartWallet Python AI", version="1.1.0")
nlp_parser = JarvisNLPParser()
market_analyzer = MarketAnalyzer()
memory = ConversationMemory(
    max_history=get_int_env("JARVIS_MEMORY_MAX_HISTORY", 200, 20, 1000),
    retention_days=get_int_env("JARVIS_MEMORY_RETENTION_DAYS", 180, 1, 3650),
)

CAPABILITIES = [
    "resumo_da_carteira",
    "analise_de_risco",
    "score_e_diversificacao",
    "recomendacoes_priorizadas",
    "rebalanceamento_educacional",
    "intencoes_de_compra_e_venda",
    "contexto_de_mercado",
    "memoria_curta_por_sessao",
    "comandos_de_hora_data_e_ajuda",
    "dados_em_tempo_real",
    "noticias_google_integradas",
    "analise_multiativa"
]

DETERMINISTIC_INTENTS = {
    IntentType.AJUDA,
    IntentType.TEMPO,
    IntentType.SISTEMA,
}


class RiskMetrics(BaseModel):
    portfolioVolatility: float
    sharpeRatio: float
    beta: float
    maxDrawdown: float
    var95: float
    riskScore: int
    riskLevel: str


class ScoreMetrics(BaseModel):
    overallScore: int
    diversificationScore: int
    riskReturnScore: int
    liquidityScore: int
    concentrationScore: int
    stabilityScore: int
    recommendations: List[str]


class Recommendation(BaseModel):
    type: str
    title: str
    description: str
    priority: int
    potentialImpact: Optional[float] = None
    actionRequired: str


class JarvisContext(BaseModel):
    riskMetrics: RiskMetrics
    scoreMetrics: ScoreMetrics
    recommendations: List[Recommendation]


class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None
    context: JarvisContext
    webSearch: bool = False


class ChatResponse(BaseModel):
    reply: str
    sessionId: str
    intent: str
    confidence: float
    actions: List[str]
    capabilities: List[str]


def get_llm():
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key or not LANGCHAIN_AVAILABLE:
        return None
    return ChatOpenAI(api_key=api_key, model=model, temperature=0.25)


def build_context_string(context: JarvisContext) -> str:
    rec_lines = "\n".join(
        f"- {rec.title}: {rec.actionRequired}" for rec in context.recommendations[:4]
    )
    score_rec_lines = "\n".join(
        f"- {line}" for line in context.scoreMetrics.recommendations[:4]
    )

    return f"""
Contexto da carteira:
- Score geral: {context.scoreMetrics.overallScore}/100
- Diversificacao: {context.scoreMetrics.diversificationScore}/100
- Liquidez: {context.scoreMetrics.liquidityScore}/100
- Concentracao: {context.scoreMetrics.concentrationScore}/100
- Volatilidade: {context.riskMetrics.portfolioVolatility:.2f}%
- Sharpe ratio: {context.riskMetrics.sharpeRatio:.2f}
- Beta: {context.riskMetrics.beta:.2f}
- Max drawdown: {context.riskMetrics.maxDrawdown:.2f}%
- VaR 95%: {context.riskMetrics.var95:.2f}%
- Nivel de risco: {context.riskMetrics.riskLevel}

Recomendacoes principais:
{rec_lines or "- Nenhuma recomendacao estruturada recebida."}

Melhorias do score:
{score_rec_lines or "- Nenhuma melhoria de score recebida."}
""".strip()


def generate_with_llm(
    message: str,
    context: JarvisContext,
    parsed: ParsedMessage,
    session_id: str,
    insights: List[MarketInsight],
) -> Optional[str]:
    llm = get_llm()
    if llm is None:
        return None

    history = memory.get_conversation_context(session_id)[-6:]
    history_text = "\n".join(
        f"{item['role']}: {item['content']}" for item in history
    ) or "Sem historico anterior."
    insight_text = "\n".join(
        f"- {item.titulo}: {item.recomendacao}" for item in insights[:4]
    ) or "- Sem alertas criticos detectados."

     # Fetch real-time data for mentioned tickers
     asset_data_text = ""
     try:
         tickers = parsed.entities.get("tickers") or []
         if tickers:
             asset_data_list = []
             for ticker in tickers[:5]:  # Limit to 5 tickers to avoid too many requests
                 data = enhanced_realtime_data_service.get_asset_data(ticker.strip().upper())
                 if "error" not in data:
                     asset_data_list.append(data)
             
             if asset_data_list:
                 asset_data_text = "\nDados em tempo real dos ativos mencionados:\n"
                 for data in asset_data_list:
                     symbol = data.get('symbol', 'N/A')
                     price = data.get('current_price', 0)
                     change = data.get('change', 0)
                     change_pct = data.get('change_percent', 0)
                     div_yield = data.get('dividend_yield', 0)
                     currency = data.get('currency', 'BRL')
                     
                     # Format change with sign
                     change_str = f"+{change:.2f}" if change > 0 else f"{change:.2f}"
                     change_pct_str = f"+{change_pct:.2f}%" if change_pct > 0 else f"{change_pct:.2f}%"
                     
                     asset_line = f"- {symbol}: {currency} {price:.2f} ({change_str} / {change_pct_str})"
                     if div_yield > 0:
                         asset_line += f", Div. Yield: {div_yield:.2f}%"
                     asset_data_text += asset_line + "\n"
                     
                     # Add recent news
                     news = enhanced_realtime_data_service.get_market_news(symbol=symbol, limit=1)
                     if news and isinstance(news, list) and len(news) > 0 and "error" not in news[0]:
                         news_item = news[0]
                         asset_data_text += f"  Última notícia: {news_item.get('title', 'N/A')} ({news_item.get('source', 'Fonte: Google News')})\n"
         except Exception:
             # Silently fail to avoid breaking the main flow
             pass

    system_prompt = """Voce e Jarvis, o assistente de IA do SmartWallet.
Responda em portugues do Brasil, com tom direto e util.
Use o contexto da carteira, a intencao detectada e os insights locais.
Nao prometa rentabilidade, nao mande comprar ou vender um ativo especifico como ordem.
Quando falar de investimento, deixe claro que e orientacao educacional, nao recomendacao financeira."""

    user_prompt = f"""
{build_context_string(context)}

Intencao detectada: {parsed.intent.value}
Confianca: {parsed.confidence:.2f}
Entidades: {parsed.entities}
Insights locais:
{insight_text}
{asset_data_text}
Historico recente:
{history_text}

Pergunta do usuario: {message}
""".strip()

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ])
        content = getattr(response, "content", "")
        return str(content).strip() or None
    except Exception:
        return None


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "llm_available": LANGCHAIN_AVAILABLE and os.getenv("OPENAI_API_KEY") is not None,
        "skills_count": len(CAPABILITIES),
        "memory": {
            "max_history": memory.max_history,
            "retention_days": memory.retention_days,
        },
    }


@app.get("/skills")
def skills() -> dict:
    return {
        "assistant": "Jarvis SmartWallet",
        "capabilities": CAPABILITIES,
        "desktop_skills_not_enabled": [
            "desligar_computador",
            "reiniciar_computador",
            "screenshot_local",
            "tocar_musica_local",
        ],
    }


@app.get("/data/health")
def data_health() -> dict:
    """Health check for the enhanced real-time data service"""
    stats = enhanced_realtime_data_service.get_cache_stats()
    return {
        "service": "EnhancedRealTimeDataService",
        "status": "healthy",
        "brapi_configured": bool(enhanced_realtime_data_service.brapi_token),
        "google_news_configured": bool(enhanced_realtime_data_service.google_api_key and enhanced_realtime_data_service.google_cse_id),
        "cache_stats": stats,
        "rate_limited": enhanced_realtime_data_service._is_rate_limited(),
        "timestamp": datetime.now().isoformat()
    }


@app.get("/data/test/{symbol}")
def test_data_service(symbol: str) -> dict:
    """Test endpoint to fetch data for a specific symbol"""
    data = enhanced_realtime_data_service.get_asset_data(symbol.upper())
    news = enhanced_realtime_data_service.get_market_news(symbol=symbol.upper(), limit=2)
    return {
        "symbol": symbol.upper(),
        "data": data,
        "news": news,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/data/calendar")
def get_calendar_data() -> dict:
    """
    Get portfolio data formatted for calendar integration
    This would typically be called by the frontend to populate calendar events
    """
    # In a real implementation, this would fetch actual portfolio data
    # For now, we'll return a structure that shows what calendar data could look like
    return {
        "calendar_events": [
            {
                "title": "Dividendo previsto: MXRF11",
                "date": "2026-06-15",
                "type": "dividendo",
                "symbol": "MXRF11",
                "amount": "R$ 0,85",
                "description": "Dividendo mensal do MXRF11"
            },
            {
                "title": "Reunião de resultados: PETR4",
                "date": "2026-07-20",
                "type": "resultado",
                "symbol": "PETR4",
                "description": "Divulgação do resultado do 2T26"
            }
        ],
        "portfolio_summary": {
            "total_value": 0,  # Would be calculated from actual portfolio
            "last_updated": datetime.now().isoformat(),
            "data_source": "EnhancedRealTimeDataService"
        },
        "instructions": "Use este endpoint para sincronizar dados da carteira com o calendário do usuário",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    session_id = payload.sessionId or str(uuid4())
    flat_context = flatten_context(payload.context)
    parsed = nlp_parser.parse(payload.message, flat_context)
    insights = build_insights(payload.context)

    memory.add_message(
        session_id=session_id,
        role="user",
        content=payload.message,
        intent=parsed.intent.value,
        sentiment=parsed.sentiment.value,
        context=flat_context,
    )

    local_reply = build_skill_reply(payload, parsed, insights)
    llm_reply = None
    if parsed.intent not in DETERMINISTIC_INTENTS:
        llm_reply = generate_with_llm(payload.message, payload.context, parsed, session_id, insights)

    reply = llm_reply or local_reply
    memory.add_message(
        session_id=session_id,
        role="assistant",
        content=reply,
        intent=parsed.intent.value,
        sentiment=parsed.sentiment.value,
        context=flat_context,
    )

    return ChatResponse(
        reply=reply,
        sessionId=session_id,
        intent=parsed.intent.value,
        confidence=round(parsed.confidence, 2),
        actions=suggest_actions(payload.context, parsed, insights),
        capabilities=CAPABILITIES,
    )


def flatten_context(context: JarvisContext) -> dict:
    return {
        **context.riskMetrics.model_dump(),
        **context.scoreMetrics.model_dump(),
        "recommendationCount": len(context.recommendations),
    }


def build_insights(context: JarvisContext) -> List[MarketInsight]:
    return market_analyzer.analyze_portfolio(
        context.riskMetrics.model_dump(),
        context.scoreMetrics.model_dump(),
        [item.model_dump() for item in context.recommendations],
    )


def build_skill_reply(payload: ChatRequest, parsed: ParsedMessage, insights: List[MarketInsight]) -> str:
    context = payload.context
    intent = parsed.intent

    if intent == IntentType.AJUDA:
        return build_help_reply()
    if intent == IntentType.TEMPO:
        return build_time_reply()
    if intent == IntentType.SISTEMA:
        return build_system_reply()
    if intent in {IntentType.RISCO, IntentType.ALERTA}:
        return build_risk_reply(context, insights)
    if intent == IntentType.REBALANCEAMENTO:
        return build_rebalance_reply(context)
    if intent == IntentType.COMPRA:
        return build_trade_reply("compra", context, parsed)
    if intent == IntentType.VENDA:
        return build_trade_reply("venda", context, parsed)
    if intent == IntentType.OPORTUNIDADE:
        return build_opportunity_reply(context, parsed)
    if intent == IntentType.BUSCA_WEB:
        return build_web_search_reply(parsed)
    if intent == IntentType.ANALISE:
        return build_analysis_reply(context, parsed, insights)

    return build_summary_reply(context, insights, payload.message)


def build_help_reply() -> str:
    return "\n".join([
        "Jarvis SmartWallet online. Posso ajudar com:",
        "- resumo da carteira, score, risco, volatilidade, beta, Sharpe e VaR;",
        "- rebalanceamento educacional e prioridades de acao;",
        "- perguntas de compra, venda e oportunidade com checklist de risco;",
        "- analise de tickers quando voce citar codigos como PETR4 ou MXRF11;",
        "- hora/data e contexto economico basico;",
        "- pesquisa atual via Google (notícias e dados em tempo real);",
        "",
        "Aviso: informacao educacional, nao recomendacao financeira.",
    ])


def build_time_reply() -> str:
    now = datetime.now()
    return (
        "Agora sao "
        f"{now.strftime('%H:%M')} de {now.strftime('%d/%m/%Y')}. "
        "Posso usar isso para organizar uma revisao rapida da sua carteira."
    )


def build_system_reply() -> str:
    return "\n".join([
        "Esses comandos de desktop existem em assistentes Jarvis tradicionais, mas aqui foram deixados fora de proposito.",
        "O SmartWallet roda como app financeiro web/backend, entao eu nao desligo computador, reinicio sistema, tiro screenshot local ou toco arquivos da maquina.",
        "O que esta ativo para o seu projeto: voz pelo navegador, chat, memoria da conversa, analise de carteira e pesquisa web opcional.",
    ])


def build_summary_reply(context: JarvisContext, insights: List[MarketInsight], user_message: str) -> str:
    lines = [
        "Jarvis Python online.",
        f"Score da carteira: {context.scoreMetrics.overallScore}/100.",
        f"Nivel de risco: {context.riskMetrics.riskLevel}.",
        f"Volatilidade: {context.riskMetrics.portfolioVolatility:.2f}%.",
        f"Sharpe: {context.riskMetrics.sharpeRatio:.2f}.",
        "",
        f'Pergunta recebida: "{user_message.strip()}".',
    ]

    if insights:
        lines.extend(["", "Pontos de atencao:"])
        lines.extend(format_insights(insights[:3]))

    lines.extend(["", "Aviso: orientacao educacional, nao recomendacao de investimento."])
    return "\n".join(lines)


def build_risk_reply(context: JarvisContext, insights: List[MarketInsight]) -> str:
    lines = [
        "Leitura de risco da carteira:",
        f"- Nivel: {context.riskMetrics.riskLevel}",
        f"- Score de risco: {context.riskMetrics.riskScore}/100",
        f"- Volatilidade: {context.riskMetrics.portfolioVolatility:.2f}%",
        f"- Max drawdown: {context.riskMetrics.maxDrawdown:.2f}%",
        f"- VaR 95%: {context.riskMetrics.var95:.2f}%",
    ]

    if insights:
        lines.extend(["", "Alertas detectados:"])
        lines.extend(format_insights(insights[:4]))

    lines.extend(["", "Aviso: orientacao educacional, nao recomendacao financeira."])
    return "\n".join(lines)


def build_rebalance_reply(context: JarvisContext) -> str:
    focused = [
        rec for rec in context.recommendations
        if rec.type.upper() in {"DIVERSIFY", "REBALANCE", "REDUCE_RISK", "INCREASE_LIQUIDITY"}
    ] or context.recommendations

    lines = [
        "Plano educacional de rebalanceamento:",
        f"- Diversificacao atual: {context.scoreMetrics.diversificationScore}/100",
        f"- Concentracao atual: {context.scoreMetrics.concentrationScore}/100",
        f"- Liquidez atual: {context.scoreMetrics.liquidityScore}/100",
        "",
        "Prioridades sugeridas:",
    ]
    lines.extend(format_recommendations(focused[:4]))
    lines.extend(["", "Use isso como checklist de revisao, nao como ordem de compra ou venda."])
    return "\n".join(lines)


def build_trade_reply(kind: str, context: JarvisContext, parsed: ParsedMessage) -> str:
    tickers = parsed.entities.get("tickers") or []
    values = parsed.entities.get("valores") or []
    target = f" para {', '.join(tickers)}" if tickers else ""
    amount = f" Valor citado: R$ {values[0]:,.2f}." if values else ""

     # Fetch real-time data for tickers
     asset_data_text = ""
     try:
         if tickers:
             asset_data_list = []
             for ticker in tickers[:3]:  # Limit to 3 tickers for trade replies
                 data = enhanced_realtime_data_service.get_asset_data(ticker.strip().upper())
                 if "error" not in data:
                     asset_data_list.append(data)
             
             if asset_data_list:
                 asset_data_text = "\nDados em tempo real:\n"
                 for data in asset_data_list:
                     symbol = data.get('symbol', 'N/A')
                     price = data.get('current_price', 0)
                     change = data.get('change', 0)
                     change_pct = data.get('change_percent', 0)
                     div_yield = data.get('dividend_yield', 0)
                     currency = data.get('currency', 'BRL')
                     
                     # Format change with sign
                     change_str = f"+{change:.2f}" if change > 0 else f"{change:.2f}"
                     change_pct_str = f"+{change_pct:.2f}%" if change_pct > 0 else f"{change_pct:.2f}%"
                     
                     asset_line = f"- {symbol}: {currency} {price:.2f} ({change_str} / {change_pct_str})"
                     if div_yield > 0:
                         asset_line += f", Div. Yield: {div_yield:.2f}%"
                     asset_data_text += asset_line + "\n"
     except Exception:
         # Silently fail to avoid breaking the main flow
         pass

    if kind == "compra":
        checklist = [
            "verifique se a compra reduz ou aumenta a concentracao;",
            "compare o ativo com alternativas de risco menor;",
            "confirme liquidez, fundamentos e horizonte de prazo;",
            "simule impacto no score antes de executar.",
        ]
    else:
        checklist = [
            "separe queda de preco de deterioracao real do ativo;",
            "confira impostos, taxas e custo de oportunidade;",
            "veja se a venda melhora risco, liquidez ou diversificacao;",
            "evite decidir apenas por medo ou euforia.",
        ]

    lines = [
        f"Para uma decisao de {kind}{target}, eu olharia assim:",
        f"- Score geral atual: {context.scoreMetrics.overallScore}/100.",
        f"- Risco atual: {context.riskMetrics.riskLevel}.",
    ]
    if amount:
        lines.append(f"-{amount}")
    if asset_data_text:
        lines.append("")
        lines.append(asset_data_text.strip())
    lines.extend(["", "Checklist:"])
    lines.extend(f"- {item}" for item in checklist)
    lines.extend(["", "Aviso: isso e apoio educacional, nao recomendacao financeira."])
    return "\n".join(lines)


def build_opportunity_reply(context: JarvisContext, parsed: ParsedMessage) -> str:
    tickers = parsed.entities.get("tickers") or []
    opportunities = [
        rec for rec in context.recommendations
        if rec.type.upper() in {"BUY_OPPORTUNITY", "WATCH_LIST", "HOLD"}
    ] or context.recommendations

     # Fetch real-time data for tickers
     asset_data_text = ""
     try:
         if tickers:
             asset_data_list = []
             for ticker in tickers[:3]:  # Limit to 3 tickers
                 data = enhanced_realtime_data_service.get_asset_data(ticker.strip().upper())
                 if "error" not in data:
                     asset_data_list.append(data)
             
             if asset_data_list:
                 asset_data_text = "\nDados em tempo real:\n"
                 for data in asset_data_list:
                     symbol = data.get('symbol', 'N/A')
                     price = data.get('current_price', 0)
                     change = data.get('change', 0)
                     change_pct = data.get('change_percent', 0)
                     div_yield = data.get('dividend_yield', 0)
                     currency = data.get('currency', 'BRL')
                     
                     # Format change with sign
                     change_str = f"+{change:.2f}" if change > 0 else f"{change:.2f}"
                     change_pct_str = f"+{change_pct:.2f}%" if change_pct > 0 else f"{change_pct:.2f}%"
                     
                     asset_line = f"- {symbol}: {currency} {price:.2f} ({change_str} / {change_pct_str})"
                     if div_yield > 0:
                         asset_line += f", Div. Yield: {div_yield:.2f}%"
                     asset_data_text += asset_line + "\n"
     except Exception:
         # Silently fail to avoid breaking the main flow
         pass

    lines = [
        "Mapa de oportunidade educacional:",
        f"- Tickers citados: {', '.join(tickers) if tickers else 'nenhum ticker especifico'}",
        f"- Score risco-retorno: {context.scoreMetrics.riskReturnScore}/100",
        f"- Liquidez: {context.scoreMetrics.liquidityScore}/100",
        "",
        "O que priorizar:",
    ]
    lines.extend(format_recommendations(opportunities[:3]))
    if asset_data_text:
        lines.extend(["", asset_data_text.strip()])
    lines.extend(["", "Para dados atuais, deixe a pesquisa Google ligada no chat."])
    return "\n".join(lines)


def build_web_search_reply(parsed: ParsedMessage) -> str:
    tickers = parsed.entities.get("tickers") or []
    subject = f" sobre {', '.join(tickers)}" if tickers else ""
    
    # Get news using the enhanced service
    if tickers:
        # Get news for the first ticker mentioned
        news_items = enhanced_realtime_data_service.get_google_news(
            query=tickers[0], 
            limit=3
        )
        
        news_text = "\nÚltimas notícias:\n"
        for item in news_items:
            if "error" not in item:
                news_text += f"• {item.get('title', 'Sem título')}\n"
                if item.get('summary'):
                    news_text += f"  {item.get('summary')}\n"
                news_text += f"  ({item.get('source', 'Fonte: Google News')})\n\n"
            else:
                news_text += f"• {item.get('summary', 'Não foi possível obter notícias')}\n\n"
        
        return (
            f"Entendi que você quer informação atual{subject}. "
            f"{news_text.strip()}"
            "Depois eu uso essas fontes como apoio, mantendo a decisão final no checklist de risco da carteira."
        )
    else:
        # General market news
        news_items = enhanced_realtime_data_service.get_google_news(
            query="mercado financeiro Brasil", 
            limit=3
        )
        
        news_text = "\nÚltimas notícias do mercado:\n"
        for item in news_items:
            if "error" not in item:
                news_text += f"• {item.get('title', 'Sem título')}\n"
                if item.get('summary'):
                    news_text += f"  {item.get('summary')}\n"
                news_text += f"  ({item.get('source', 'Fonte: Google News')})\n\n"
            else:
                news_text += f"• {item.get('summary', 'Não foi possível obter notícias do mercado')}\n\n"
        
        return (
            f"Entendi que você quer informação atual do mercado. "
            f"{news_text.strip()}"
            "Depois eu uso essas fontes como apoio, mantendo a decisão final no checklist de risco da carteira."
        )


def build_analysis_reply(context: JarvisContext, parsed: ParsedMessage, insights: List[MarketInsight]) -> str:
    tickers = parsed.entities.get("tickers") or []
    lines = [
        f"Analise solicitada para: {', '.join(tickers) if tickers else 'sua carteira'}.",
        f"- Score geral: {context.scoreMetrics.overallScore}/100",
        f"- Nivel de risco: {context.riskMetrics.riskLevel}",
        f"- Diversificacao: {context.scoreMetrics.diversificationScore}/100",
        f"- Risco-retorno: {context.scoreMetrics.riskReturnScore}/100",
    ]

     # Add real-time data for tickers
     if tickers:
         try:
             lines.append("")
             lines.append("Dados em tempo real:")
             for ticker in tickers[:5]:  # Limit to 5 tickers
                 data = enhanced_realtime_data_service.get_asset_data(ticker.strip().upper())
                 if "error" not in data:
                     symbol = data.get('symbol', 'N/A')
                     price = data.get('current_price', 0)
                     change = data.get('change', 0)
                     change_pct = data.get('change_percent', 0)
                     div_yield = data.get('dividend_yield', 0)
                     currency = data.get('currency', 'BRL')
                     
                     # Format change with sign
                     change_str = f"+{change:.2f}" if change > 0 else f"{change:.2f}"
                     change_pct_str = f"+{change_pct:.2f}%" if change_pct > 0 else f"{change_pct:.2f}%"
                     
                     asset_line = f"- {symbol}: {currency} {price:.2f} ({change_str} / {change_pct_str})"
                     if div_yield > 0:
                         asset_line += f", Div. Yield: {div_yield:.2f}%"
                     lines.append(asset_line)
                     
                     # Add recent news
                     news = enhanced_realtime_data_service.get_market_news(symbol=symbol, limit=1)
                     if news and isinstance(news, list) and len(news) > 0 and "error" not in news[0]:
                         news_item = news[0]
                         lines.append(f"  Última notícia: {news_item.get('title', 'N/A')} ({news_item.get('source', 'Fonte: Google News')})")
         except Exception:
             # Silently fail to avoid breaking the main flow
             pass

    if insights:
        lines.extend(["", "Leitura do Jarvis:"])
        lines.extend(format_insights(insights[:3]))

    lines.extend(["", "Aviso: orientacao educacional, nao recomendacao financeira."])
    return "\n".join(lines)


def suggest_actions(context: JarvisContext, parsed: ParsedMessage, insights: List[MarketInsight]) -> List[str]:
    actions = []

    if parsed.intent in {IntentType.RISCO, IntentType.ALERTA} and insights:
        actions.append("revisar_alertas_de_risco")
    if context.scoreMetrics.diversificationScore < 50:
        actions.append("avaliar_diversificacao")
    if context.scoreMetrics.liquidityScore < 45:
        actions.append("avaliar_liquidez")
    if parsed.entities.get("tickers"):
        actions.append("consultar_ticker")
    if parsed.intent == IntentType.BUSCA_WEB:
        actions.append("usar_pesquisa_google")

    return actions[:5]


def format_insights(insights: List[MarketInsight]) -> List[str]:
    return [
        f"- {item.titulo}: {item.descricao} Acao: {item.recomendacao}"
        for item in insights
    ]


def format_recommendations(recommendations: List[Recommendation]) -> List[str]:
    if not recommendations:
        return ["- Nenhuma recomendacao prioritaria foi gerada agora."]

    return [
        f"- {rec.title}: {rec.actionRequired}"
        for rec in recommendations
    ]
