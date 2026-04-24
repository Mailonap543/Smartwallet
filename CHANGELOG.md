# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ✅ Comprehensive CI/CD pipeline with GitHub Actions
- ✅ Code coverage for backend (JaCoCo) and frontend (Vitest)
- ✅ Code quality integration (ESLint, SonarQube)
- ✅ Docker Compose for production, staging, and monitoring
- ✅ Development environment configuration (`docker-compose.dev.yml`)
- ✅ Environment configuration files for Angular
- ✅ Contributing guidelines
- ✅ MIT License
- ✅ Code of Conduct
- ✅ Environment variables template
- ✅ Project documentation

### Changed
- Enhanced test coverage from 0% to 83.3% (20/24 tests passing)
- Integrated pre-commit hooks and automated quality checks
- Updated frontend build pipeline with optimized configurations

### Fixed
- Resolved linting issues across codebase
- Fixed test configuration inconsistencies
- Corrected environment variable handling

## [0.0.1] - 2026-04-24

### Added
- Initial project setup
- Backend: Spring Boot 3.2.4 with Kotlin
- Frontend: Angular 21 with TypeScript
- Database: PostgreSQL with Flyway migrations
- Cache: Redis integration
- Security: Spring Security with JWT
- API: RESTful endpoints for wallet management
- Market data: Integration with financial data providers
- Basic UI: Dashboard, asset tracking, calculators
- Cypress E2E tests (9 scenarios)
- Basic monitoring setup (Prometheus, Grafana, Loki)

### Known Issues
- Authentication uses stub (X-User-Id header) - needs JWT implementation
- AI analysis endpoints are stubs - needs real AI integration
- Subscription validation is stub - needs payment gateway integration
- Prometheus/Grafana dashboards not fully configured
- Health check endpoints not implemented

## [Future Roadmap]

### Planned Features
1. **Authentication**
   - Implement JWT-based authentication
   - OAuth2 integration
   - Multi-factor authentication

2. **AI Integration**
   - Real AI analysis endpoints
   - Machine learning models for predictions
   - Natural language processing for queries

3. **Subscription Management**
   - Stripe/PayPal integration
   - Automated billing
   - Plan management

4. **Monitoring**
   - Complete observability setup
   - Custom Grafana dashboards
   - Alert configuration

5. **Performance**
   - Implement caching strategies
   - Database query optimization
   - CDN integration

6. **Testing**
   - Achieve 90%+ code coverage
   - E2E tests in CI pipeline
   - Load testing setup

## [Version History]

| Version | Date | Status | Description |
|---------|------|--------|-------------|
| 1.0.0 | TBD | Planned | Production release with all core features |
| 0.1.0 | TBD | Planned | Beta release with basic functionality |
| 0.0.1 | 2026-04-24 | Current | Initial development version |