from __future__ import annotations

from typing import Any, Callable, Dict, List

def _tool(name: str, description: str, params: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "type": "function",
        "function": {"name": name, "description": description, "parameters": params},
    }

JARVIS_TOOLS: List[Dict[str, Any]] = [
    _tool(
        "get_portfolio_summary",
        "Devolve resumo numerico da carteira do usuario (scores, risco, sharpe, volatilidade, beta, drawdown, VaR).",
        {"type": "object", "properties": {}, "required": []},
    ),
    _tool(
        "list_top_recommendations",
        "Lista as recomendacoes prioritarias atualmente carregadas para a carteira.",
        {
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "minimum": 1, "maximum": 10, "default": 5}
            },
            "required": [],
        },
    ),
    _tool(
        "simulate_buy",
        "Simula o impacto educacional de uma compra hipotetica em concentracao e diversificacao. Nao executa ordem.",
        {
            "type": "object",
            "properties": {
                "symbol": {"type": "string", "description": "Ticker (ex: PETR4, MXRF11)"},
                "amount_brl": {"type": "number", "minimum": 0},
            },
            "required": ["symbol", "amount_brl"],
        },
    ),
    _tool(
        "compute_risk_breakdown",
        "Decompoe o risco em componentes (volatilidade, beta, drawdown, VaR) e classifica criticidade.",
        {"type": "object", "properties": {}, "required": []},
    ),
    _tool(
        "recall_long_term_memory",
        "Busca semantica no historico longo do usuario (preferencias, conversas antigas, perfil). Use quando o usuario fizer pergunta pessoal ou citar algo antigo.",
        {
            "type": "object",
            "properties": {
                "query": {"type": "string"},
                "top_k": {"type": "integer", "minimum": 1, "maximum": 8, "default": 4},
            },
            "required": ["query"],
        },
    ),
]

def _h_get_portfolio_summary(args: Dict[str, Any], ctx) -> Dict[str, Any]:
    return {
        "score_geral": ctx.scoreMetrics.overallScore,
        "diversificacao": ctx.scoreMetrics.diversificationScore,
        "liquidez": ctx.scoreMetrics.liquidityScore,
        "concentracao": ctx.scoreMetrics.concentrationScore,
        "volatilidade_pct": round(ctx.riskMetrics.portfolioVolatility, 2),
        "sharpe": round(ctx.riskMetrics.sharpeRatio, 2),
        "beta": round(ctx.riskMetrics.beta, 2),
        "max_drawdown_pct": round(ctx.riskMetrics.maxDrawdown, 2),
        "var95_pct": round(ctx.riskMetrics.var95, 2),
        "nivel_risco": ctx.riskMetrics.riskLevel,
    }

def _h_list_top_recommendations(args: Dict[str, Any], ctx) -> Dict[str, Any]:
    limit = int(args.get("limit", 5))
    items = sorted(ctx.recommendations, key=lambda r: r.priority)[:limit]
    return {
        "recommendations": [
            {
                "titulo": r.title,
                "descricao": r.description,
                "tipo": r.type,
                "prioridade": r.priority,
                "acao": r.actionRequired,
                "impacto_estimado": r.potentialImpact,
            }
            for r in items
        ]
    }

def _h_simulate_buy(args: Dict[str, Any], ctx) -> Dict[str, Any]:
    symbol = str(args.get("symbol", "")).upper().strip()
    amount = float(args.get("amount_brl", 0))
    concentration = max(1, ctx.scoreMetrics.concentrationScore)
    impact_score = round(min(100.0, amount / 1000.0 * (100 - concentration) / 100), 2)
    return {
        "ticker": symbol,
        "valor_simulado_brl": amount,
        "impacto_estimado_concentracao": impact_score,
        "alerta_diversificacao": ctx.scoreMetrics.diversificationScore < 60,
        "nota": "Simulacao educacional. Nao e ordem nem recomendacao financeira.",
    }

def _h_compute_risk_breakdown(args: Dict[str, Any], ctx) -> Dict[str, Any]:
    r = ctx.riskMetrics

    def crit(v: float, mid: float, high: float) -> str:
        if v >= high:
            return "alto"
        if v >= mid:
            return "medio"
        return "baixo"

    return {
        "componentes": {
            "volatilidade": {"valor_pct": r.portfolioVolatility, "criticidade": crit(r.portfolioVolatility, 15, 25)},
            "beta": {"valor": r.beta, "criticidade": crit(abs(r.beta - 1), 0.3, 0.6)},
            "drawdown": {"valor_pct": r.maxDrawdown, "criticidade": crit(r.maxDrawdown, 15, 30)},
            "var95": {"valor_pct": r.var95, "criticidade": crit(r.var95, 5, 10)},
            "sharpe": {"valor": r.sharpeRatio, "criticidade": "baixo" if r.sharpeRatio > 1 else "medio" if r.sharpeRatio > 0.3 else "alto"},
        },
        "risk_score": r.riskScore,
        "nivel": r.riskLevel,
    }

def _h_recall_long_term_memory(args: Dict[str, Any], ctx, *, recall_fn: Callable[[str, int], List[Dict[str, Any]]] | None = None) -> Dict[str, Any]:
    if recall_fn is None:
        return {"hits": [], "warning": "long_term_memory_disabled"}
    query = str(args.get("query", "")).strip()
    top_k = int(args.get("top_k", 4))
    return {"hits": recall_fn(query, top_k)}

TOOL_HANDLERS: Dict[str, Callable[..., Dict[str, Any]]] = {
    "get_portfolio_summary": _h_get_portfolio_summary,
    "list_top_recommendations": _h_list_top_recommendations,
    "simulate_buy": _h_simulate_buy,
    "compute_risk_breakdown": _h_compute_risk_breakdown,
    "recall_long_term_memory": _h_recall_long_term_memory,
}

def execute_tool(name: str, args: Dict[str, Any], ctx, *, recall_fn=None) -> Dict[str, Any]:
    handler = TOOL_HANDLERS.get(name)
    if handler is None:
        return {"error": f"unknown_tool:{name}"}
    if name == "recall_long_term_memory":
        return handler(args, ctx, recall_fn=recall_fn)
    return handler(args, ctx)