from __future__ import annotations

import os
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel

try:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage
    from langchain_core.prompts import ChatPromptTemplate
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

app = FastAPI(title="SmartWallet Python AI", version="1.0.0")


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


class ChatResponse(BaseModel):
    reply: str
    sessionId: str


def get_llm():
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    if not api_key or not LANGCHAIN_AVAILABLE:
        return None
    return ChatOpenAI(api_key=api_key, model=model, temperature=0.3)


def build_context_string(context: JarvisContext) -> str:
    return f"""
Contexto da Carteira:
- Score Geral: {context.scoreMetrics.overallScore}/100
- Volatilidade: {context.riskMetrics.portfolioVolatility:.2f}%
- Sharpe Ratio: {context.riskMetrics.sharpeRatio:.2f}
- Beta: {context.riskMetrics.beta:.2f}
- Max Drawdown: {context.riskMetrics.maxDrawdown:.2f}%
- VaR 95%: {context.riskMetrics.var95:.2f}%
- Nível de Risco: {context.riskMetrics.riskLevel}

Recomendações atuais:
{chr(10).join(f"- {r.title}: {r.actionRequired}" for r in context.recommendations[:3])}
"""


def generate_with_llm(message: str, context: JarvisContext) -> str:
    llm = get_llm()
    if llm is None:
        return None

    system_prompt = """Você é Jarvis, um assistente de IA especializado em análise de investimentos.
Seja conciso, útil e educacional. Não dê recomendações de investimento específicas, apenas orientações gerais.
Sempre inclua um aviso de que é informação educacional, não recomendação financeira."""

    context_str = build_context_string(context)
    user_prompt = f"Contexto da carteira:\n{context_str}\n\nPergunta do usuário: {message}"

    try:
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        chain = prompt | llm
        response = chain.invoke({})
        return response.content
    except Exception:
        return None


@app.get("/health")
def health() -> dict:
    return {"ok": True, "llm_available": LANGCHAIN_AVAILABLE and os.getenv("OPENAI_API_KEY") is not None}


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    session_id = payload.sessionId or str(uuid4())

    llm_reply = generate_with_llm(payload.message, payload.context)

    if llm_reply:
        return ChatResponse(reply=llm_reply, sessionId=session_id)

    score = payload.context.scoreMetrics.overallScore
    risk_level = payload.context.riskMetrics.riskLevel
    recs = payload.context.recommendations[:3]

    lines: List[str] = [
        "Jarvis Python online.",
        f"Score da carteira: {score}/100.",
        f"Nível de risco: {risk_level}.",
        "",
        f'Pergunta recebida: "{payload.message.strip()}"',
    ]

    if recs:
        lines.append("")
        lines.append("Ações sugeridas agora:")
        for idx, rec in enumerate(recs, start=1):
            lines.append(f"{idx}. {rec.title} — {rec.actionRequired}")

    lines.append("")
    lines.append("Aviso: orientação educacional, não recomendação de investimento.")

    return ChatResponse(reply="\n".join(lines), sessionId=session_id)