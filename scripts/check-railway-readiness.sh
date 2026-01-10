#!/bin/bash

# 🔍 Railway Deployment Readiness Check Script
# Перевіряє чи всі сервіси готові до deployment на Railway

echo "🔍 Checking Railway Deployment Readiness..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        ((ERRORS++))
        return 1
    fi
}

# Function to check package.json for required scripts
check_package_scripts() {
    local service_path=$1
    local package_json="$service_path/package.json"
    
    if [ ! -f "$package_json" ]; then
        echo -e "${RED}✗${NC} Missing package.json in $service_path"
        ((ERRORS++))
        return 1
    fi
    
    # Check for required scripts
    if grep -q '"start"' "$package_json" && \
       grep -q '"build"' "$package_json"; then
        echo -e "${GREEN}✓${NC} $service_path has required scripts (build, start)"
        return 0
    else
        echo -e "${RED}✗${NC} $service_path missing required scripts"
        ((ERRORS++))
        return 1
    fi
}

echo "=== Checking Root Configuration ==="
check_file "package.json"
check_file ".gitignore"
check_file "railway.toml"
check_file "RAILWAY_DEPLOYMENT.md"
check_file "DEPLOYMENT_CHECKLIST.md"

# Check if node_modules is in gitignore
if grep -q "node_modules/" ".gitignore"; then
    echo -e "${GREEN}✓${NC} node_modules in .gitignore"
else
    echo -e "${YELLOW}⚠${NC} node_modules NOT in .gitignore (will cause Railway warning)"
    ((WARNINGS++))
fi

# Check if start script exists in root package.json
if grep -q '"start"' "package.json"; then
    echo -e "${GREEN}✓${NC} Root package.json has start script"
else
    echo -e "${RED}✗${NC} Root package.json missing start script"
    ((ERRORS++))
fi

echo ""
echo "=== Checking Dashboard ==="
check_dir "dashboard"
check_file "dashboard/package.json"
check_package_scripts "dashboard"

echo ""
echo "=== Checking Microservices ==="

SERVICES=(
    "auth-service"
    "user-service"
    "project-service"
    "task-service"
    "team-service"
    "chat-service"
    "invoice-service"
    "notification-service"
    "file-service"
)

for service in "${SERVICES[@]}"; do
    echo ""
    echo "--- Checking $service ---"
    check_dir "services/$service"
    check_file "services/$service/package.json"
    check_file "services/$service/railway.toml"
    check_package_scripts "services/$service"
    
    # Check for src directory
    if [ -d "services/$service/src" ]; then
        echo -e "${GREEN}✓${NC} services/$service/src exists"
    else
        echo -e "${RED}✗${NC} services/$service/src missing"
        ((ERRORS++))
    fi
    
    # Check for index.ts/index.js
    if [ -f "services/$service/src/index.ts" ] || [ -f "services/$service/src/index.js" ]; then
        echo -e "${GREEN}✓${NC} services/$service has entry point"
    else
        echo -e "${YELLOW}⚠${NC} services/$service missing src/index.ts"
        ((WARNINGS++))
    fi
done

echo ""
echo "=== Checking Shared Package ==="
check_dir "shared"
check_file "shared/package.json"

echo ""
echo "=== Summary ==="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for Railway deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'feat: add Railway deployment configuration'"
    echo "3. git push origin main"
    echo "4. Follow DEPLOYMENT_CHECKLIST.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Checks passed with $WARNINGS warning(s)${NC}"
    echo "You can proceed with deployment, but consider fixing warnings."
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo "Please fix errors before deploying to Railway."
    exit 1
fi
