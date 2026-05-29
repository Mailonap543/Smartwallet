import json
import os
from datetime import datetime
from typing import AsyncIterator, List, Optional
from uuid import uuid4

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from analysis.market_analyzer import MarketAnalyzer, MarketInsight
from memory.conversation_memory import ConversationMemory
from memory.long_term_memory import LongTermMemory
from parser.nlp_parser import IntentType, JarvisNLPParser, ParsedMessage
from tools.jarvis_tools import JARVIS_TOOLS, execute_tool

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


def get_int_env(name: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return max(minimum, min(maximum, value))


app = FastAPI(title="SmartWallet Python AI", version="1.2.0")
nlp_parser = JarvisNLPParser()
market_analyzer = MarketAnalyzer()
memory = ConversationMemory(
    max_history=get_int_env("JARVIS_MEMORY_MAX_HISTORY", 200, 20, 1000),
    retention_days=get_int_env("JARVIS_MEMORY_RETENTION_DAYS", 180, 1, 3650),
)
long_term = LongTermMemory(
    db_path=os.getenv("JARVIS_LTM_DB_PATH", "data/jarvis_ltm.sqlite"),
    embed_model=os.getenv("JARVIS_EMBED_MODEL", "text-embedding-3-small"),
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
    "memoria_longa_por_embeddings",
    "function_calling_com_ferramentas_tipadas",
    "streaming_sse",
    "comandos_de_hora_data_e_ajuda",
]

DETERMINISTIC_INTENTS = {
    IntentType.AJUDA,
    IntentType.TEMPO,
    IntentType.SISTEMA,
}


# ----- Pydantic models (iguais ao PR) -------------------------------------


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


# ----- LLM ---------------------------------------------------------------


def get_llm(streaming: bool = False, with_tools: bool = False):
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key or not LANGCHAIN_AVAILABLE:
        return None
    llm = ChatOpenAI(api_key=api_key, model=model, temperature=0.2, streaming=streaming)
    if with_tools:
        llm = llm.bind_tools(JARVIS_TOOLS)
    return llm


SYSTEM_PROMPT = """Voce e Jarvis, o assistente de IA do SmartWallet.
Responda em portugues do Brasil, com tom direto e util.
Use o contexto da carteira, a intencao detectada e os insights locais.
Sempre que precisar de numero exato (score, sharpe, risco), CHAME a tool correspondente
em vez de inventar. Para perguntas pessoais ou referencia ao passado do usuario,
chame recall_long_term_memory antes de responder.
Nao prometa rentabilidade, nao mande comprar/vender como ordem.
Tudo e orientacao educacional, nao recomendacao financeira."""


def build_context_string(context: JarvisContext) -> str:
    rec_lines = "\n".join(
        f"- {rec.title}: {rec.actionRequired}" for rec in context.recommendations[:4]
    )
    score_rec_lines = "\n".join(
        f"- {line}" for line in context.scoreMetrics.recommendations[:4]
    )
    return f"""Contexto da carteira:
- Score geral: {context.scoreMetrics.overallScore}/100
- Diversificacao: {context.scoreMetrics.diversificationScore}/100
- Liquidez: {context.scoreMetrics.liquidityScore}/100
- Concentracao: {context.scoreMetrics.concentrationScore}/100
- Volatilidade: {context.riskMetrics.portfolioVolatility:.2f}%
- Sharpe: {context.riskMetrics.sharpeRatio:.2f}
- Beta: {context.riskMetrics.beta:.2f}
- Drawdown: {context.riskMetrics.maxDrawdown:.2f}%
- VaR 95%: {context.riskMetrics.var95:.2f}%
- Nivel: {context.riskMetrics.riskLevel}

Recomendacoes:
{rec_lines or "- Nenhuma."}

Melhorias de score:
{score_rec_lines or "- Nenhuma."}"""


def _build_messages(
    message: str,
    context: JarvisContext,
    parsed: ParsedMessage,
    session_id: str,
    insights: List[MarketInsight],
):
    history = memory.get_conversation_context(session_id)[-6:]
    history_text = "\n".join(f"{i['role']}: {i['content']}" for i in history) or "Sem historico."
    insight_text = "\n".join(f"- {i.titulo}: {i.recomendacao}" for i in insights[:4]) or "- Nenhum."

    # Recall semantica antes do prompt, alem da tool (boost de relevancia)
    ltm_hits = []
    if long_term.is_enabled():
        ltm_hits = long_term.recall(session_id, message, top_k=3)
    ltm_text = "\n".join(f"- ({h['similarity']}) {h['text']}" for h in ltm_hits) or "- Sem memoria longa relevante."

    user_prompt = f"""{build_context_string(context)}

Intencao: {parsed.intent.value} (conf {parsed.confidence:.2f})
Entidades: {parsed.entities}

Insitos locais:
{insight_text}

Memoria longa relevante:
{ltm_text}

Historico curto:
{history_text}

Pergunta: {message}"""
    return [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=user_prompt)]


def _recall_fn_for(session_id: str):
    def fn(query: str, top_k: int):
        return long_term.recall(session_id, query, top_k=top_k)
    return fn


def generate_with_llm(
    message: str,
    context: JarvisContext,
    parsed: ParsedMessage,
    session_id: str,
    insights: List[MarketInsight],
    *,
    max_tool_rounds: int = 3,
) -> Optional[str]:
    """Roda LLM com function calling: ate N rounds de tool execution."""
    llm = get_llm(streaming=False, with_tools=True)
    if llm is None:
        return None
    messages = _build_messages(message, context, parsed, session_id, insights)
    recall_fn = _recall_fn_for(session_id)
    try:
        for _ in range(max_tool_rounds):
            ai_msg: AIMessage = llm.invoke(messages)
            messages.append(ai_msg)
            tool_calls = getattr(ai_msg, "tool_calls", None) or []
            if not tool_calls:
                content = getattr(ai_msg, "content", "")
                return str(content).strip() or None
            for call in tool_calls:
                name = call.get("name") if isinstance(call, dict) else call.name
                args = call.get("args") if isinstance(call, dict) else call.args
                call_id = call.get("id") if isinstance(call, dict) else call.id
                result = execute_tool(name, args or {}, context, recall_fn=recall_fn)
                messages.append(ToolMessage(content=json.dumps(result, ensure_ascii=False), tool_call_id=call_id))
        # estourou rounds: pede resposta final sem tools
        plain = get_llm(streaming=False, with_tools=False)
        if plain is None:
            return None
        final = plain.invoke(messages)
        return str(getattr(final, "content", "")).strip() or None
    except Exception:
        return None


# ----- Endpoints ---------------------------------------------------------


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "llm_available": LANGCHAIN_AVAILABLE and os.getenv("OPENAI_API_KEY") is not None,
        "long_term_memory_available": long_term.is_enabled(),
        "skills_count": len(CAPABILITIES),
        "tools_count": len(JARVIS_TOOLS),
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
        "tools": [t["function"]["name"] for t in JARVIS_TOOLS],
        "desktop_skills_not_enabled": [
            "desligar_computador",
            "reiniciar_computador",
            "screenshot_local",
            "tocar_musica_local",
        ],
    }


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    session_id = payload.sessionId or str(uuid4())
    flat_context = flatten_context(payload.context)
    parsed = nlp_parser.parse(payload.message, flat_context)
    insights = build_insights(payload.context)

    memory.add_message(
        session_id=session_id, role="user", content=payload.message,
        intent=parsed.intent.value, sentiment=parsed.sentiment.value, context=flat_context,
    )

    local_reply = build_skill_reply(payload, parsed, insights)
    llm_reply = None
    if parsed.intent not in DETERMINISTIC_INTENTS:
        llm_reply = generate_with_llm(payload.message, payload.context, parsed, session_id, insights)

    reply = llm_reply or local_reply
    memory.add_message(
        session_id=session_id, role="assistant", content=reply,
        intent=parsed.intent.value, sentiment=parsed.sentiment.value, context=flat_context,
    )

    # persiste no LTM: pergunta + resposta concatenadas (1 vetor por turno)
    if long_term.is_enabled():
        long_term.add(
            session_id=session_id,
            text=f"Usuario: {payload.message}\nJarvis: {reply}",
            metadata={"intent": parsed.intent.value, "ts": datetime.utcnow().isoformat()},
        )

    return ChatResponse(
        reply=reply, sessionId=session_id,
        intent=parsed.intent.value, confidence=round(parsed.confidence, 2),
        actions=suggest_actions(payload.context, parsed, insights),
        capabilities=CAPABILITIES,
    )


@app.post("/chat/stream")
async def chat_stream(payload: ChatRequest):
    """SSE streaming. Faz tool round se necessario, depois streama a resposta final."""
    session_id = payload.sessionId or str(uuid4())
    flat_context = flatten_context(payload.context)
    parsed = nlp_parser.parse(payload.message, flat_context)
    insights = build_insights(payload.context)

    memory.add_message(
        session_id=session_id, role="user", content=payload.message,
        intent=parsed.intent.value, sentiment=parsed.sentiment.value, context=flat_context,
    )

    async def event_gen() -> AsyncIterator[bytes]:
        def sse(event: str, data: dict) -> bytes:
            return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")

        yield sse("meta", {"sessionId": session_id, "intent": parsed.intent.value, "confidence": round(parsed.confidence, 2)})

        # Caminho deterministic: nao streama do LLM, manda local de uma vez
        if parsed.intent in DETERMINISTIC_INTENTS or not (LANGCHAIN_AVAILABLE and os.getenv("OPENAI_API_KEY")):
            local = build_skill_reply(payload, parsed, insights)
            yield sse("token", {"delta": local})
            yield sse("done", {"final": local})
            memory.add_message(session_id=session_id, role="assistant", content=local,
                               intent=parsed.intent.value, sentiment=parsed.sentiment.value, context=flat_context)
            return

        # 1) executa rounds de tool (nao-stream) e depois streama o ultimo turno
        try:
            llm_tools = get_llm(streaming=False, with_tools=True)
            messages = _build_messages(payload.message, payload.context, parsed, session_id, insights)
            recall_fn = _recall_fn_for(session_id)
            used_tools: List[str] = []
            for _ in range(3):
                ai_msg = llm_tools.invoke(messages)
                messages.append(ai_msg)
                tool_calls = getattr(ai_msg, "tool_calls", None) or []
                if not tool_calls:
                    break
                for call in tool_calls:
                    name = call.get("name") if isinstance(call, dict) else call.name
                    args = call.get("args") if isinstance(call, dict) else call.args
                    call_id = call.get("id") if isinstance(call, dict) else call.id
                    used_tools.append(name)
                    yield sse("tool", {"name": name, "args": args})
                    result = execute_tool(name, args or {}, payload.context, recall_fn=recall_fn)
                    yield sse("tool_result", {"name": name, "result": result})
                    messages.append(ToolMessage(content=json.dumps(result, ensure_ascii=False), tool_call_id=call_id))

            # 2) ultima chamada streamada, sem tools (modelo so escreve a resposta)
            llm_stream = get_llm(streaming=True, with_tools=False)
            buf: List[str] = []
            async for chunk in llm_stream.astream(messages):
                delta = getattr(chunk, "content", "") or ""
                if delta:
                    buf.append(delta)
                    yield sse("token", {"delta": delta})
            final = "".join(buf).strip() or build_skill_reply(payload, parsed, insights)
            yield sse("done", {"final": final, "tools_used": used_tools})

            memory.add_message(session_id=session_id, role="assistant", content=final,
                               intent=parsed.intent.value, sentiment=parsed.sentiment.value, context=flat_context)
            if long_term.is_enabled():
                long_term.add(session_id=session_id,
                              text=f"Usuario: {payload.message}\nJarvis: {final}",
                              metadata={"intent": parsed.intent.value, "ts": datetime.utcnow().isoformat()})
        except Exception as exc:
            fallback = build_skill_reply(payload, parsed, insights)
            yield sse("error", {"message": str(exc)[:200]})
            yield sse("token", {"delta": fallback})
            yield sse("done", {"final": fallback})

    return StreamingResponse(event_gen(), media_type="text/event-stream")


# ----- Helpers (mantidos do PR, copiados) --------------------------------


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
    # NOTE: copiado do main.py original do PR #62; mantenha as funcoes
    # build_help_reply, build_time_reply, build_system_reply,
    # build_risk_reply, build_rebalance_reply, build_trade_reply,
    # build_opportunity_reply, build_web_search_reply, build_analysis_reply,
    # build_summary_reply e suggest_actions exatamente como ja estao no PR.
    # Para nao duplicar codigo aqui, importe-as ou cole-as abaixo.
    from main_helpers import (  # type: ignore
        build_help_reply, build_time_reply, build_system_reply,
        build_risk_reply, build_rebalance_reply, build_trade_reply,
        build_opportunity_reply, build_web_search_reply, build_analysis_reply,
        build_summary_reply,
    )
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


def suggest_actions(context: JarvisContext, parsed: ParsedMessage, insights: List[MarketInsight]) -> List[str]:
    from main_helpers import suggest_actions as _sa  # type: ignore
    return _sa(context, parsed, insights)