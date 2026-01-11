#!/bin/bash

# 🎯 Quick Test Script - Запустити всі тести
# Usage: ./scripts/test-all.sh

echo "🧪 Running all microservices tests..."
echo ""

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

TOTAL_TESTS=0
TOTAL_FAILED=0
FAILED_SERVICES=()

for SERVICE in "${SERVICES[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Testing: $SERVICE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  cd "services/$SERVICE" || continue
  
  if npm test -- --coverage --passWithNoTests 2>&1 | tee /tmp/test-$SERVICE.log; then
    echo "✅ $SERVICE: PASSED"
  else
    echo "❌ $SERVICE: FAILED"
    FAILED_SERVICES+=("$SERVICE")
    ((TOTAL_FAILED++))
  fi
  
  # Extract test count
  TESTS=$(grep -oP '\d+(?= passed)' /tmp/test-$SERVICE.log | head -1)
  if [ -n "$TESTS" ]; then
    ((TOTAL_TESTS += TESTS))
  fi
  
  cd ../..
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total tests run: $TOTAL_TESTS"
echo "Services tested: ${#SERVICES[@]}"
echo "Failed services: $TOTAL_FAILED"

if [ $TOTAL_FAILED -eq 0 ]; then
  echo ""
  echo "🎉 ALL TESTS PASSED!"
  echo ""
  exit 0
else
  echo ""
  echo "❌ FAILED SERVICES:"
  for SERVICE in "${FAILED_SERVICES[@]}"; do
    echo "  - $SERVICE"
  done
  echo ""
  exit 1
fi
