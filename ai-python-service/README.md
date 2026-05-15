# SmartWallet Python AI Service

Microserviço Python para conversar com o backend Kotlin via HTTP. Integração com LLMs para análise inteligente.

## ✨ Funcionalidades

- ✅ Endpoint `/health` - Status do serviço
- ✅ Endpoint `/chat` - Chat com contexto de carteira
- ✅ Integração com OpenAI (GPT-4o-mini) via LangChain
- ✅ Fallback local quando LLM não está disponível
- ✅ Suporte a `.env` para configuração

## Como rodar localmente

```bash
cd ai-python-service

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (opcional)
copy .env.example .env
# Editar .env com sua OPENAI_API_KEY

# Rodar o servidor
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Configuração

### Variáveis de ambiente (.env)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OPENAI_API_KEY` | Chave da API OpenAI | (obrigatória para LLM) |
| `OPENAI_MODEL` | Modelo GPT a usar | `gpt-4o-mini` |
| `HOST` | Host do servidor | `0.0.0.0` |
| `PORT` | Porta do servidor | `8001` |

### Com LLM (recomendado)

1. Obtenha uma API key da OpenAI
2. Configure no `.env`: `OPENAI_API_KEY=sk-...`
3. O serviço usará automaticamente o GPT para respostas inteligentes

### Sem LLM (modo fallback)

Se `OPENAI_API_KEY` não estiver configurada, o serviço usará respostas pré-definidas locais.

## Endpoints

### GET /health

```json
{
  "ok": true,
  "llm_available": true
}
```

### POST /chat

Request:
```json
{
  "message": "Qual meu nível de risco?",
  "sessionId": "optional-session-id",
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
  "reply": "Seu nível de risco é MODERATE com score 50...",
  "sessionId": "uuid-or-provided-session-id"
}
```

## Integração com Backend Kotlin

No `application.yaml` do backend:

```yaml
smartwallet:
  ai:
    python:
      mock-enabled: false  # false = usa HttpPythonAiClient (este serviço)
      base-url: http://localhost:8001
      timeout-ms: 5000
```

## Dependências

- **FastAPI** - Framework web assíncrono
- **LangChain** - Framework para aplicações LLM
- **LangChain-OpenAI** - Integração OpenAI para LangChain
- **OpenAI** - SDK oficial da OpenAI
- **Python-dotenv** - Carregamento de variáveis de ambiente

## Desenvolvimento

```bash
# Instalar dependências de desenvolvimento
pip install pytest httpx

# Rodar testes
pytest tests/

# Lint
pip install ruff
ruff check .
```