#!/bin/bash

# Перевірка lint для всіх сервісів

ALL_SERVICES=(
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

FAILED_SERVICES=()
PASSED_SERVICES=()

echo "🔍 Running lint on ALL services..."
echo ""

for SERVICE in "${ALL_SERVICES[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Linting: $SERVICE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  cd "services/$SERVICE" || continue
  
  if npm run lint 2>&1 | grep -q "✖.*problems"; then
    echo "❌ FAILED: $SERVICE"
    FAILED_SERVICES+=("$SERVICE")
    npm run lint 2>&1 | grep "error\|warning" | head -10
  else
    echo "✅ PASSED: $SERVICE"
    PASSED_SERVICES+=("$SERVICE")
  fi
  
  cd ../..
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Passed: ${#PASSED_SERVICES[@]}/9"
echo "❌ Failed: ${#FAILED_SERVICES[@]}/9"
echo ""

if [ ${#PASSED_SERVICES[@]} -gt 0 ]; then
  echo "✅ PASSED SERVICES:"
  for SERVICE in "${PASSED_SERVICES[@]}"; do
    echo "  - $SERVICE"
  done
  echo ""
fi

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
  echo "❌ FAILED SERVICES:"
  for SERVICE in "${FAILED_SERVICES[@]}"; do
    echo "  - $SERVICE"
  done
  echo ""
  exit 1
fi

echo "🎉 ALL SERVICES PASSED LINT!"
