from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def payload(message: str, web_search: bool = False) -> dict:
    return {
        "message": message,
        "sessionId": "test-session",
        "webSearch": web_search,
        "context": {
            "riskMetrics": {
                "portfolioVolatility": 28.4,
                "sharpeRatio": 0.21,
                "beta": 1.35,
                "maxDrawdown": 16.2,
                "var95": 4.8,
                "riskScore": 82,
                "riskLevel": "HIGH",
            },
            "scoreMetrics": {
                "overallScore": 62,
                "diversificationScore": 28,
                "riskReturnScore": 41,
                "liquidityScore": 38,
                "concentrationScore": 44,
                "stabilityScore": 58,
                "recommendations": ["Diversificar setores", "Aumentar liquidez"],
            },
            "recommendations": [
                {
                    "type": "REDUCE_RISK",
                    "title": "Reduzir risco",
                    "description": "Carteira concentrada",
                    "priority": 1,
                    "potentialImpact": 8.0,
                    "actionRequired": "Revisar concentracao e ativos volateis",
                }
            ],
        },
    }


def test_health_exposes_skills_count():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["ok"] is True
    assert response.json()["skills_count"] > 0


def test_help_command_returns_capabilities(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    response = client.post("/chat", json=payload("ajuda"))

    assert response.status_code == 200
    data = response.json()
    assert data["sessionId"] == "test-session"
    assert data["intent"] == "ajuda"
    assert "resumo da carteira" in data["reply"]


def test_risk_command_uses_portfolio_context(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    response = client.post("/chat", json=payload("qual meu risco?"))

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "risco"
    assert "HIGH" in data["reply"]
    assert "Risco elevado" in data["reply"]
    assert "revisar_alertas_de_risco" in data["actions"]


def test_desktop_command_is_not_enabled(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    response = client.post("/chat", json=payload("desligar computador"))

    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "sistema"
    assert "nao desligo computador" in data["reply"]
