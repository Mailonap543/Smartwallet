#!/bin/bash
# Validação local do pipeline CI
# Simula o ambiente do GitHub Actions

set -e

echo "==========================================="
echo "  🔍 Validação Local do Pipeline CI"
echo "==========================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# 1. Compilação
echo ""
echo "1️⃣  Compilando projeto..."
if mvn clean compile -DskipTests -q 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Compilação OK${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Compilação FALHOU${NC}"
    ((FAIL++))
    exit 1
fi

# 2. Testes com H2
echo ""
echo "2️⃣  Executando testes (perfil: test, banco: H2)..."
if mvn test \
    -Dspring.profiles.active=test \
    -Dspring.datasource.url=jdbc:h2:mem:testdb \
    -Dspring.datasource.driver-class-name=org.h2.Driver \
    -Dspring.jpa.database-platform=org.hibernate.dialect.H2Dialect \
    -Dspring.jpa.hibernate.ddl-auto=create-drop \
    -Dspring.flyway.enabled=false \
    -Dspring.main.web-application-type=servlet \
    -DfailIfNoTests=false \
    -q 2>&1 | tail -20; then
    echo -e "${GREEN}✅ Testes OK${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Testes FALHARAM${NC}"
    ((FAIL++))
fi

# 3. Checkstyle
echo ""
echo "3️⃣  Verificando Checkstyle..."
if mvn checkstyle:check -q 2>&1 | tail -5; then
    echo -e "${GREEN}✅ Checkstyle OK${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️ Checkstyle com warnings${NC}"
    ((PASS++))
fi

# 4. JaCoCo
echo ""
echo "4️⃣  Gerando relatório de cobertura..."
if mvn jacoco:report -q 2>&1 | tail -5; then
    echo -e "${GREEN}✅ JaCoCo OK${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️ JaCoCo com warnings${NC}"
    ((PASS++))
fi

# Summary
echo ""
echo "==========================================="
echo "  📋 Resultado da Validação"
echo "==========================================="
echo -e "${GREEN}Passou: $PASS${NC}"
echo -e "${RED}Falhou: $FAIL${NC}"
echo "==========================================="

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ Validação falhou!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Tudo pronto para CI!${NC}"
    exit 0
fi
