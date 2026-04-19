# SmartWallet

Plataforma de investimentos full-stack com backend em Spring Boot/Kotlin e frontend Angular.

## Stack
- Backend: Spring Boot 3, Kotlin, Spring Security, JPA, Flyway, PostgreSQL
- Frontend: Angular 21, Tailwind, ApexCharts/Chart.js
- Infra: Docker, Nginx

## Pré-requisitos
- Java 25
- Node.js 20+ e npm 10+
- PostgreSQL (ou usar perfis dev com seed)

## Backend (Spring Boot)
```bash
# compilar e testar
mvn clean verify

# rodar local
mvn spring-boot:run
```
Endpoints principais usam prefixos `/api` e `/api/v1`. Para chamadas autenticadas, passe o header `X-User-Id` (stub de auth).

Migrações Flyway são aplicadas no start. Perfil dev carrega seeds de mercado em `src/main/resources/data/market_seed.json`.

## Frontend (Angular)
```bash
cd smartwallet-front
npm install
npm run start   # http://localhost:4200
```
Ajuste a base de API em `smartwallet-front/src/app/services/api.service.ts` se necessário (default: http://localhost:8080/api).

## Estrutura rápida
- `src/main/kotlin/com/smartwallet/market` – domínio de mercado (ativos, rankings, busca, histórico, proventos)
- `portfolio` – carteiras, ativos da carteira, transações, proventos
- `watchlist` – favoritos, watchlists, alertas
- `news` – notícias por ativo
- `subscription` – status de assinatura (stub)
- `ai` – endpoints de IA (stub)
- `audit` – logging mínimo de auditoria
- `smartwallet-front/src/app/pages` – páginas Angular (dashboard, market, detail, rankings, compare, screener, wallet, favorites, news, calculators)

## Testes
```bash
mvn test
```
Inclui testes de integração para market, wallet, watchlist e news.


