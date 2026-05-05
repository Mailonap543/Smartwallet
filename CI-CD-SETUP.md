# 🚀 CI/CD Setup Guide

## Problemas Resolvidos

### 1. Falha de Conexão com Banco de Dados nos Testes
**Problema:** Os testes falhavam no GitHub Actions porque tentavam conectar a um banco PostgreSQL inexistente.

**Solução:**
- Criado perfil de teste (`application-test.properties`) usando H2 Database (banco em memória)
- Configurado Maven para usar H2 durante os testes
- Flyway desabilitado no perfil de teste

**Arquivos criados:**
- `src/test/resources/application-test.properties`

### 2. Variáveis de Ambiente Ausentes
**Problema:** Spring falhava ao resolver placeholders como `${VAR_NAME}`.

**Solução:**
- Configurações sensíveis movidas para GitHub Secrets
- Placeholders com valores padrão no `application-test.properties`
- Segurança desabilitada no perfil de teste

### 3. Auto-Labeler Problemático
**Problema:** Workflow `pr-review.yml` tentava usar `actions/labeler` sem configuração adequada.

**Solução:**
- Desativado por padrão (`if: false`)
- Documentado como configuração manual
- Labels definidos em `.github/labels.yml`

## Estrutura de Perfis

### Profile: `default` (production)
- Banco: PostgreSQL (via Flyway)
- Redis: Ativado
- Segurança: OAuth2/JWT
- Cache: Caffeine + Redis

### Profile: `test` (CI/CD)
- Banco: H2 (em memória)
- Flyway: Desabilitado
- Segurança: Desabilitada
- Cache: Desabilitado
- Auto-configuração: Ativada

## Executando Localmente

### Testes Simples
```bash
mvn test -Dspring.profiles.active=test
```

### Build Completo
```bash
mvn clean verify -Dspring.profiles.active=test
```

### Validação CI Local
```bash
./validate-ci.sh
```

## Workflows GitHub Actions

### 1. CI Pipeline (`ci.yml`)
**Trigger:** Push para `main/develop` ou PR

**Jobs:**
- Pre-checks (segredos, tamanho de arquivos)
- Backend build & test (Java 21, Maven)
- Frontend build & test (Angular 21, npm)
- Docker build
- SonarQube analysis
- CodeQL security scan
- Deploy automático (GitHub Pages)

**Segredos Necessários:**
```
SONAR_TOKEN        - Token do SonarQube
SONAR_HOST_URL     - URL do SonarQube
DOCKERHUB_TOKEN    - Token do DockerHub (opcional)
```

### 2. PR Review (`pr-review.yml`)
**Trigger:** PR aberto/sincronizado

**Jobs:**
- Checkstyle
- SpotBugs
- Testes unitários
- Codecov
- Auto-labeling (desativado)

### 3. Nightly Build (`nightly.yml`)
**Trigger:** Diário às 2:00 AM UTC

**Jobs:**
- Build completo
- SonarQube full scan
- Relatórios de cobertura

### 4. CodeQL (`codeql-analysis.yml`)
**Trigger:** Push/PR + Semanal

**Jobs:**
- Varredura de segurança Java
- Varredura de segurança JavaScript/TypeScript
- npm audit

### 5. Release (`release.yml`)
**Trigger:** Tag `v*`

**Jobs:**
- Pré-validação
- SonarQube Quality Gate
- Changelog automático
- GitHub Release
- Docker push (opcional)
- Deploy Kubernetes (opcional)

## Qualidade de Código

### SonarQube
- **Cobertura mínima:** 80%
- **Bugs críticos:** 0
- **Vulnerabilidades:** 0
- **Code Smells:** Mínimo

### Checkstyle
- Padrão: Google Java Style
- Máximo: 120 caracteres por linha

### ESLint (Frontend)
- Regras: Padrão Airbnb
- Zero warnings em build

## Troubleshooting

### Testes falham no CI mas passam localmente
**Causa:** Perfil ativo diferente
**Solução:** Garantir que `spring.profiles.active=test` está configurado

### SonarQube falha
**Causa:** Token inválido ou expirado
**Solução:** Renovar token em Settings → Secrets

### Docker build falha
**Causa:** Contexto incorreto
**Solução:** Verificar Dockerfile e paths

### Coverage baixo
**Causa:** Testes insuficientes
**Solução:** Adicionar testes para cobrir código não testado

## Dicas

1. **Sempre rode localmente antes de commitar:**
   ```bash
   ./validate-ci.sh
   ```

2. **Use profiles para desenvolvimento:**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Monitore o SonarQube:**
   - Acesso: https://sonarcloud.io
   - Projeto: smartwallet-backend

4. **Verifique dependências:**
   - Dependabot cria PRs automaticamente
   - Revise vulnerabilidades: `npm audit` / `mvn dependency-check`

## Links Úteis

- [GitHub Actions](https://github.com/features/actions)
- [SonarQube Cloud](https://sonarcloud.io)
- [Codecov](https://codecov.io)
- [Docker Hub](https://hub.docker.com)
- [Conventional Commits](https://www.conventionalcommits.org)
