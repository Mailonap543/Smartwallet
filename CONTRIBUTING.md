# Contributing to Smartwallet

First off, thank you for considering contributing to Smartwallet! It's people like you that make this project better.

## 🚀 Getting Started

### Prerequisites
- Java 17+ (Temurin recommended)
- Node.js 20+
- Maven 3.8+
- Docker & Docker Compose

### Development Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/smartwallet.git
   cd smartwallet
   ```

2. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Backend setup**
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

4. **Frontend setup**
   ```bash
   cd smartwallet-front
   npm ci
   npm run start
   ```

## 📝 Code Style

### Backend (Java/Kotlin)
- Follow Google Java Style Guide
- Use Spring Boot best practices
- Write unit tests with JUnit 5
- Coverage threshold: 80%

### Frontend (TypeScript/Angular)
- Use Angular Style Guide
- ESLint with Angular rules
- Prettier for formatting
- Write unit tests with Vitest
- Write E2E tests with Cypress

## 🔄 Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `mvn test` and `npm run test`
5. **Commit changes**: Use conventional commits
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## ✨ Code Quality

### Before Committing
- Run all tests
- Check code coverage
- Run ESLint
- Format with Prettier
- Update documentation if needed

### Commit Message Convention
```
type(scope): description

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

## 🧪 Testing

### Backend Tests
```bash
mvn test
# View coverage report
open target/site/jacoco/index.html
```

### Frontend Unit Tests
```bash
cd smartwallet-front
npm run test        # Watch mode
npm run test:ci     # CI mode with coverage
```

### Frontend E2E Tests
```bash
cd smartwallet-front
npm run e2e         # Run Cypress tests
```

## 📊 Code Review Process

1. All PRs require at least 1 approval
2. CI must pass (tests, lint, build)
3. Code coverage must not decrease
4. No critical SonarQube issues

## 🐛 Reporting Issues

- Use GitHub Issues
- Include reproduction steps
- Add relevant labels

## 💡 Feature Requests

- Open a GitHub Discussion first
- Gather community feedback
- Create an issue if approved

## 🔒 Security

- Report vulnerabilities privately
- Don't commit secrets
- Review SECURITY.md

## 🙏 Thank You!

Thank you for contributing to Smartwallet!