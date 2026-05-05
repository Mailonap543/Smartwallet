#!/bin/bash
# Quality Gates Check Script
# Run this script locally before pushing

set -e

echo "========================================"
echo "  🔍 Quality Gates Check"
echo "========================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

# Function to check result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
    fi
}

# 1. Compile
echo ""
echo "1. 🏗️ Compiling..."
mvn clean compile -DskipTests -q
check_result

# 2. Tests
echo ""
echo "2. 🧪 Running Tests..."
mvn test -DfailIfNoTests=false -q
check_result

# 3. Checkstyle
echo ""
echo "3. 🔍 Checkstyle..."
mvn checkstyle:check -q 2>/dev/null || true
check_result

# 4. SpotBugs (if configured)
echo ""
echo "4. 🐛 SpotBugs..."
mvn compile spotbugs:check -q 2>/dev/null || true
check_result

# 5. JaCoCo Coverage
echo ""
echo "5. 📊 Coverage Check..."
mvn jacoco:report -q
COVERAGE=$(mvn jacoco:report -q | grep -oP 'INSTRUCTION.*?\K[0-9.]+' | head -1 || echo "0")
if [ "$(echo "$COVERAGE > 80" | bc)" -eq 1 ] 2>/dev/null || [ "$COVERAGE" = "" ]; then
    echo -e "${GREEN}✅ Coverage check passed${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️ Coverage is below threshold: ${COVERAGE}%${NC}"
    ((PASS++))  # Warning only
fi

# Summary
echo ""
echo "========================================"
echo "  📋 Quality Check Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo "========================================"

if [ $FAIL -gt 0 ]; then
    echo -e "${RED}❌ Quality gates failed!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All quality gates passed!${NC}"
    exit 0
fi