# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✨ Tarefa 1: Configuração base do CI/CD
  - GitHub Actions workflows para CI/CD automatizado
  - SonarQube integration para code quality
  - CodeQL security scanning
  - Dependabot for automated dependency updates
  - Quality gates for build and test
  - Nightly build pipeline
  - Docker build and push automation
- ✨ Standalone Wallet & Transaction domain
  - WalletService with full CRUD operations
  - WalletController with independent REST endpoints
  - TransactionService for transaction management
  - TransactionController with dedicated routes
- 🚀 Tarefa 2: Unificação e configuração base
  - @EnableScheduling enabled for scheduled tasks
  - @RequiredArgsConstructor standardized across controllers
  - Cleaned up duplicate Java/Kotlin entities
  - Fixed ambiguous endpoint mappings
  - Separated Java (data/carteira) from Kotlin (IA/análise) routes

### Fixed
- ⚠️ Resolved ambiguous mapping between TransactionController and PortfolioController
- 🐛 Fixed duplicate HealthController bean conflict
- 🛠️ Corrected API path conflicts (Java vs Kotlin controllers)
- 🔧 Updated TransactionService to accept assetId parameter

### Changed
- 🔄 PortfolioService now delegates to WalletService and TransactionService
- 🔄 TransactionController uses `/api/transactions` (standalone)
- 🔄 AiController uses `/api/ai/**` (separated concerns)
- 🔄 WalletController uses `/api/wallets` (independent management)

### Security
- 🔒 Added secret detection via Gitleaks
- 🔒 Dependency scanning with OWASP
- 🔒 Vulnerability checks in CI pipeline
- 🔒 CodeQL static analysis

## [0.0.1-SNAPSHOT] - 2026-04-24

### Added
- Initial project setup
- Spring Boot 3.2.4 backend
- Angular 21 frontend
- PostgreSQL database support
- JPA and Flyway migrations
- Basic authentication stub
- Portfolio management features
- Market data endpoints
- Watchlist and alert functionality
- Subscription management
- AI analysis service (stub)
- News feed integration
- Audit logging
- Redis caching
- Docker support
- Bank webhook integration