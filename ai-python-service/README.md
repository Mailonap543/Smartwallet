# SmartWallet Python AI Service

Microservico Python do Jarvis SmartWallet. Ele conversa com o backend Kotlin via HTTP, recebe o contexto da carteira e responde com analise educacional.

## Funcionalidades

- Endpoint `/health` para status do servico
- Endpoint `/skills` para listar capacidades do Jarvis
- Endpoint `/chat` com contexto de carteira
- Intencoes locais inspiradas em assistentes Jarvis: ajuda, hora/data, risco, resumo, analise, compra, venda, oportunidade, rebalanceamento e pesquisa web
- Memoria curta por `sessionId`
- Insights locais de risco, diversificacao, liquidez e retorno ajustado ao risco
- Integracao opcional com OpenAI via LangChain
- Fallback local quando LLM nao esta disponivel

Comandos desktop do exemplo original, como desligar computador, reiniciar, screenshot e tocar musica local, nao foram habilitados porque o SmartWallet e um app financeiro web/backend. A entrada por voz fica no navegador e o backend fica focado em carteira, mercado e seguranca.

## Como rodar localmente

```bash
cd ai-python-service

py -3.12 -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env

uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Use Python 3.12 localmente, o mesmo usado no `Dockerfile`. Python 3.14 ainda pode falhar ao instalar o `pydantic-core` fixado nas dependencias.

## Configuracao

| Variavel | Descricao | Padrao |
| --- | --- | --- |
| `OPENAI_API_KEY` | Chave da API OpenAI | vazia |
| `OPENAI_MODEL` | Modelo a usar | `gpt-4o-mini` |
| `HOST` | Host do servidor | `0.0.0.0` |
| `PORT` | Porta do servidor | `8001` |
| `JARVIS_MEMORY_MAX_HISTORY` | Mensagens mantidas por sessao | `200` |
| `JARVIS_MEMORY_RETENTION_DAYS` | Dias de retencao da memoria em processo | `180` |

Sem `OPENAI_API_KEY`, o Jarvis usa respostas locais estruturadas.

## Endpoints

### GET /health

```json
{
  "ok": true,
  "llm_available": false,
  "skills_count": 9
}
```

### GET /skills

Retorna as capacidades ativas do Jarvis SmartWallet.

### POST /chat

Request:

```json
{
  "message": "Qual meu nivel de risco?",
  "sessionId": "optional-session-id",
  "webSearch": true,
  "context": {
    "riskMetrics": {
      "portfolioVolatility": 15.5,
      "sharpeRatio": 0.8,
      "beta": 1.1,
      "maxDrawdown": 8.0,
      "var95": 3.0,
      "riskScore": 50,
      "riskLevel": "MODERATE"
    },
    "scoreMetrics": {
      "overallScore": 75,
      "diversificationScore": 35,
      "riskReturnScore": 60,
      "liquidityScore": 40,
      "concentrationScore": 70,
      "stabilityScore": 65,
      "recommendations": ["Diversifique seus investimentos"]
    },
    "recommendations": []
  }
}
```

Response:

```json
{
  "reply": "Leitura de risco da carteira...",
  "sessionId": "optional-session-id",
  "intent": "risco",
  "confidence": 0.63,
  "actions": ["revisar_alertas_de_risco"],
  "capabilities": ["resumo_da_carteira"]
}
```

## Integracao com Backend Kotlin

No `application.yaml` do backend:

```yaml
smartwallet:
  ai:
    python:
      mock-enabled: false
      base-url: http://localhost:8001
      timeout-ms: 5000
```

O Kotlin tambem pode anexar resultados/link de Google Search quando o chat envia `webSearch=true` e a pergunta pede dados atuais.

## Desenvolvimento

```bash
pip install pytest httpx
pytest
```
