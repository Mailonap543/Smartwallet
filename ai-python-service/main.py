from __future__ import annotations

from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel


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


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    session_id = payload.sessionId or str(uuid4())

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

