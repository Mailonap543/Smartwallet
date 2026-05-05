# SmartWallet

Plataforma de investimentos full-stack com backend em Spring Boot/Kotlin e frontend Angular.

## Stack
- Backend: Spring Boot 3, Kotlin, Spring Security, JPA, Flyway, PostgreSQL
- Frontend: Angular 21, Tailwind, ApexCharts/Chart.js
- Infra: Docker, Nginx

## Pré-requisitos
- Java 17
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

## 🚀 CI/CD - Integração Contínua e Deploy

### Pipeline GitHub Actions

O projeto possui pipelines automatizados para build, teste, qualidade de código e deploy:

#### Workflows Disponíveis

1. **CI Pipeline** (`ci.yml`)
   - 🔍 Pré-validações (secrets, tamanho de arquivos)
   - ☕ Build e testes backend (Java 21 + Maven)
   - 🎨 Build e testes frontend (Angular 21 + npm)
   - 🐳 Build Docker images
   - 📊 Upload de artefatos
   - 🚀 Deploy automático (GitHub Pages)

2. **PR Review** (`pr-review.yml`)
   - 🔍 Checkstyle & SpotBugs
   - 🧪 Testes automatizados
   - 🏷️ Auto-labeling de PRs

3. **Nightly Build** (`nightly.yml`)
   - 🌙 Execução diária às 2:00 AM UTC
   - 🔍 SonarQube full scan
   - 📊 Relatórios de cobertura

4. **CodeQL Analysis** (`codeql-analysis.yml`)
   - 🔐 Varredura de segurança semanal
   - 🔍 ESLint security scan (frontend)
   - 🔐 npm audit

5. **Dependabot** (`dependabot.yml`)
   - 🔄 Atualização automática de dependências
   - 📅 Maven (segunda-feira)
   - 📅 npm (terça-feira)
   - 📅 GitHub Actions (quarta-feira)

### Badges do CI/CD

Adicione ao seu README:

```markdown
![Build](https://github.com/<owner>/smartwallet/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/<owner>/smartwallet/actions/workflows/codeql-analysis.yml/badge.svg)
![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=smartwallet-backend&metric=alert_status)
![Coverage](https://codecov.io/gh/<owner>/smartwallet/branch/main/graph/badge.svg)
```

### Secrets Necessários

Configure no repositório (Settings → Secrets → Actions):

- `SONAR_TOKEN`: Token do SonarQube para análise de código
- `SONAR_HOST_URL`: URL do servidor SonarQube
- `CODECOV_TOKEN`: Token do Codecov (opcional)
- `DOCKERHUB_TOKEN`: Token para push de imagens (opcional)

### Qualidade de Código

#### SonarQube
- Cobertura mínima: 80%
- Sem bugs críticos
- Sem vulnerabilidades
- Sem code smells

#### Checkstyle
- Padrão Google Java Style
- Máximo 120 caracteres por linha

#### ESLint
- Airbnb style guide (frontend)
- Zero warnings no build

### Deploy

O deploy automático ocorre no push para `main`:
- Frontend → GitHub Pages
- Backend → Docker Hub (opcional)

Para deploy manual:
```bash
# Frontend
cd smartwallet-front
npm run build

# Backend
mvn clean package
docker build -t smartwallet/backend .
```

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

## Notas de segurança
- PRNG inseguro removido (uso de `SecureRandom`)
- Logs não expõem parâmetros controlados pelo usuário
- Autenticação definitiva ainda pendente; usar JWT/OAuth em produção

## Próximos passos sugeridos
- Implementar auth real (JWT/OAuth2) e remover stub `X-User-Id`
- Ingestão externa de mercado/dividendos/earnings e agenda
- Remover mocks do frontend e integrar totalmente aos endpoints
- Cobrir acessibilidade (WCAG 2.2), observabilidade e testes E2E
