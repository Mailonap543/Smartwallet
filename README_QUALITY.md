# Guia de Qualidade de Código - Smartwallet

## Visão Geral
Este documento descreve as configurações de qualidade de código, testes e CI/CD implementadas no projeto Smartwallet.

## Estrutura do Projeto
- **Backend**: Java 17 + Spring Boot 3.2.4 + Kotlin + Maven
- **Frontend**: Angular 21 + TypeScript + Vitest

## Configurações Implementadas

### 1. EditorConfig (.editorconfig)
- Configuração unificada para backend e frontend
- Indentação: 4 espaços para Java, 2 espaços para TypeScript/JavaScript
- Encoding UTF-8
- Final de linha LF
- Remoção de espaços em branco no final das linhas

### 2. Controle de Versão (.gitignore)
- Ignora arquivos de build, dependências e logs
- Exclusão de arquivos temporários do sistema
- Não versiona arquivos de configuração local

### 3. Testes

#### Frontend (Angular + Vitest)
- Framework de testes: Vitest
- Ambiente: jsdom
- Cobertura de código: v8 (HTML, JSON, LCOV)
- Cobertura mínima alvo: 80%

**Scripts disponíveis:**
```bash
npm run test          # Executa testes no modo watch
npm run test:ci       # Executa testes com cobertura (CI)
npm run build         # Build de produção
```

#### Backend (Java + Maven)
- Framework de testes: JUnit 5 + Spring Boot Test
- Cobertura: JaCoCo
- Relatórios: HTML e XML

**Comandos disponíveis:**
```bash
mvn test              # Executa testes unitários
mvn jacoco:report     # Gera relatório de cobertura
```

### 4. CI/CD - GitHub Actions

#### Workflow: `ci.yml`

**Jobs configurados:**

1. **backend-build**
   - JDK 21 (Temurin)
   - Build com Maven
   - Testes unitários
   - Upload de artefatos de teste
   - SonarQube Scan

2. **frontend-test**
   - Node.js 20
   - Instalação de dependências
   - Testes unitários com cobertura
   - Upload de relatórios de cobertura

3. **frontend-build**
   - Build de produção Angular
   - Upload de artefatos

4. **sonarqube-frontend**
   - Análise estática do frontend
   - Relatório de cobertura via LCOV

5. **docker**
   - Build de imagens Docker

### 5. SonarQube

#### Configuração do Backend
- Arquivo: `sonar-project.properties`
- Linguagem: Java/Kotlin
- Cobertura: JaCoCo XML
- Exclusões: Testes, node_modules, dist

#### Configuração do Frontend
- Linguagem: TypeScript
- Cobertura: LCOV
- Exclusões: node_modules, dist, spec.ts

### 6. Code Coverage

#### Backend (JaCoCo)
- Relatório em: `target/site/jacoco/index.html`
- Formato XML para integração contínua

#### Frontend (Vitest + v8)
- Relatório em: `coverage/`
- Formatos: HTML, JSON, LCOV
- Upload automático para Codecov

## Variáveis de Ambiente Necessárias

### GitHub Secrets
```
SONAR_TOKEN          # Token de autenticação do SonarQube
SONAR_HOST_URL       # URL do servidor SonarQube
CODECOV_TOKEN        # Token do Codecov (opcional)
```

## Como Executar Localmente

### Backend
```bash
# Compilar
mvn clean compile

# Executar testes
mvn test

# Ver cobertura
mvn jacoco:report
open target/site/jacoco/index.html
```

### Frontend
```bash
cd smartwallet-front

# Instalar dependências
npm ci

# Executar testes
npm run test

# Executar testes com cobertura
npm run test:ci

# Build de produção
npm run build
```

## Pipeline CI/CD

O workflow é acionado em:
- Push para branches: `main`, `develop`
- Pull Requests para branches: `main`, `develop`

**Ordem de execução:**
1. Testes backend
2. Testes frontend
3. Build frontend (depende dos testes)
4. SonarQube scans
5. Build Docker

## Metas de Qualidade

- Cobertura de testes mínima: 80%
- Sem falhas nos testes unitários
- Sem vulnerabilidades críticas no SonarQube
- Build verde em todas as branches

## Integração Contínua

- Codecov para visualização de cobertura
- SonarQube para análise estática
- GitHub Actions para automação
- Relatórios de testes e cobertura em artefatos

## Contribuição

1. Execute testes localmente antes de commit
2. Mantenha cobertura de código acima de 80%
3. Respeite as convenções do EditorConfig
4. Documente novas funcionalidades