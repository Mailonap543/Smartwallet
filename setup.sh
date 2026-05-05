#!/bin/bash
# SmartWallet Initial Setup Script
# Run this script to set up the development environment

set -e

echo "=========================================="
echo "  🚀 SmartWallet Initial Setup"
echo "=========================================="

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f 2 | cut -d'.' -f 1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        echo "✅ Java $(java -version 2>&1 | head -n 1)"
    else
        echo "❌ Java 17+ required (found $JAVA_VERSION)"
        exit 1
    fi
else
    echo "❌ Java not found. Please install Java 17+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f 2 | cut -d'.' -f 1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo "✅ Node.js $(node --version)"
    else
        echo "❌ Node.js 20+ required (found $(node --version))"
        exit 1
    fi
else
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check Maven
if command -v mvn &> /dev/null; then
    echo "✅ Maven $(mvn --version | head -n 1)"
else
    echo "❌ Maven not found. Please install Maven 3.8+"
    exit 1
fi

echo ""
echo "📦 Installing backend dependencies..."
mvn dependency:go-offline -q

echo ""
echo "📦 Installing frontend dependencies..."
cd smartwallet-front
npm ci
cd ..

echo ""
echo "🏗️ Building backend..."
mvn clean compile -DskipTests -q

echo ""
echo "🏗️ Building frontend..."
cd smartwallet-front
npm run build
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "=========================================="
echo "  🎉 Ready to develop!"
echo "=========================================="
echo ""
echo "Quick start:"
echo "  1. Backend: mvn spring-boot:run"
echo "  2. Frontend: cd smartwallet-front && npm start"
echo "  3. Tests: mvn test (backend)"
echo "  4. Lint: npm run lint (frontend)"
echo ""
echo "CI/CD:"
echo "  - Push to main/develop triggers CI pipeline"
echo "  - PRs trigger automated tests and review"
echo "  - Nightly builds run at 2:00 AM UTC"
echo "=========================================="
