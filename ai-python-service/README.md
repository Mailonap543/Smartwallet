# SmartWallet Python AI Service

Microservico Python para conversar com o backend Kotlin via HTTP.

## Rodar localmente

```bash
cd ai-python-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Endpoints

- `GET /health`
- `POST /chat`

## Integracao com o backend Kotlin

No `application.yaml` do backend:

- `SMARTWALLET_AI_PYTHON_MOCK_ENABLED=false`
- `SMARTWALLET_AI_PYTHON_BASE_URL=http://localhost:8001`

