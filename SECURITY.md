# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | ✅ Current stable  |
| < 1.0   | ❌ Unsupported     |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** create a public GitHub issue
2. Send an email to `security@smartwallet.com` with:
   - Description of the vulnerability
   - Steps to reproduce
   - Severity assessment (Critical/High/Medium/Low)
   - Suggested fix (optional)

3. We will respond within **48 hours**
4. A CVE will be reserved for valid vulnerabilities
5. Fixes will be released as soon as possible

## Vulnerability Severity Levels

- 🔴 **Critical**: Remote code execution, SQL injection, authentication bypass
- 🟠 **High**: XSS, CSRF, privilege escalation
- 🟡 **Medium**: Information disclosure, logic flaws
- 🟢 **Low**: Minor issues with minimal impact

## Security Testing

All PRs are automatically scanned for:
- 🔐 Secret detection (Gitleaks)
- 🐛 Known vulnerabilities (Dependabot)
- 📊 Code quality (SonarQube)
- 🔍 Static analysis (CodeQL)
- 📦 Dependency audit (npm audit, OWASP)

## Responsible Disclosure

We follow responsible disclosure practices:
- 90-day disclosure timeline
- CVSS scoring for severity
- Coordinated disclosure when necessary

## Security Tools

Enable these for local development:
```bash
# SonarQube local analysis
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000

# OWASP dependency check
mvn org.owasp:dependency-check-maven:check
```

## Security Contacts

- 📧 security@smartwallet.com (PGP: `...`)
- 🐛 GitHub Security Tab

## Security Badges

[![Security Status](https://sonarcloud.io/api/project_badges/measure?project=smartwallet-backend&metric=security_rating)](https://sonarcloud.io/dashboard?id=smartwallet-backend)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=smartwallet-backend&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=smartwallet-backend)
