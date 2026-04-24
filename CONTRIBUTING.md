# 🤝 Contributing to SmartWallet

We welcome contributions! Here's how you can help improve SmartWallet.

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 20+
- Maven 3.8+
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/smartwallet/smartwallet.git
cd smartwallet

# Backend
mvn clean compile

# Frontend
cd smartwallet-front
npm install
npm start
```

## 📋 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
git checkout -b fix/issue-description
git checkout -b hotfix/critical-fix
```

### 2. Make Changes
- Follow the code style (Google Java Style for Java, Airbnb for TypeScript)
- Add tests for new features
- Update documentation if needed
- Ensure all CI checks pass

### 3. Run Quality Checks
```bash
# Local quality check
./quality-check.sh

# Or manually
mvn clean test
npm run lint
```

### 4. Commit Changes
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add user authentication"

# Bug fixes
git commit -m "fix: resolve null pointer in transaction list"

# Documentation
git commit -m "docs: update README with new endpoints"

# Refactoring
git commit -m "refactor: extract wallet service to standalone module"

# Breaking changes
git commit -m "feat!: redesign API endpoints"
```

### 5. Push and Create PR
```bash
git push origin your-branch
```

Then create a Pull Request using the template.

## 🔍 Code Reviews

All PRs require:
- ✅ Passing CI/CD pipeline
- ✅ At least 1 approval
- ✅ No new code smells or security issues
- ✅ Updated tests
- ✅ Documentation updates (if applicable)

## 🎯 Coding Standards

### Java/Kotlin
- Use Spring Boot best practices
- Follow SOLID principles
- Write meaningful test names
- Coverage target: 80%+
- No hardcoded credentials
- Use Lombok where appropriate

### TypeScript/Angular
- Use Angular style guide
- Strong typing (no `any`)
- RxJS best practices
- Component tests with Vitest
- E2E tests with Cypress

### SQL/Flyway
- Use migrations for schema changes
- Never modify existing migrations
- Use repeatable migrations for views/procedures

## 🔒 Security Guidelines

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all user inputs
- Sanitize outputs to prevent XSS
- Use parameterized queries (no string concatenation)
- Follow OWASP Top 10

## 📦 Dependency Management

- Use Dependabot for automated updates
- Review major version updates carefully
- Check for vulnerabilities: `mvn org.owasp:dependency-check-maven:check`
- Frontend: `npm audit`

## 🚦 CI/CD Pipeline

Every PR triggers:
1. ✅ Code compilation
2. 🧪 Unit tests
3. 🔍 Code quality (SonarQube)
4. 🔐 Security scan (CodeQL)
5. 📊 Coverage report
6. 🏷️ Auto-labeling

## 📞 Support

- 💬 Discord: [Join our community](https://discord.gg/smartwallet)
- 📧 Email: dev@smartwallet.com
- 🐛 Issues: [GitHub Issues](https://github.com/smartwallet/smartwallet/issues)

## 🙏 Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md`
- Release notes
- Project documentation

Thank you for contributing to SmartWallet! 🎉
