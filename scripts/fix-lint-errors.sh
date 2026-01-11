#!/bin/bash

# Скрипт для швидкого виправлення типових lint помилок у всіх сервісах

SERVICES=(
  "user-service"
  "project-service"
  "task-service"
  "team-service"
  "chat-service"
  "invoice-service"
  "notification-service"
  "file-service"
)

echo "🔧 Fixing common lint errors in all services..."

for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Fixing: $SERVICE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  cd "services/$SERVICE" || continue
  
  # 1. Replace @ts-ignore with @ts-expect-error
  echo "  ✓ Replacing @ts-ignore with @ts-expect-error..."
  find src -name "*.ts" -type f -exec sed -i '' 's/@ts-ignore/@ts-expect-error/g' {} \;
  
  # 2. Remove unused unique import from schema
  echo "  ✓ Removing unused 'unique' import from schema..."
  if [ -f "src/db/schema.ts" ]; then
    sed -i '' 's/, unique//g; s/unique, //g' src/db/schema.ts
  fi
  
  # 3. Remove unused Redis import
  echo "  ✓ Removing unused 'Redis' import..."
  find src -name "*.ts" -type f -exec sed -i '' "s/import { Redis } from 'ioredis';//g" {} \;
  find src -name "*.ts" -type f -exec sed -i '' "s/import Redis from 'ioredis';//g" {} \;
  
  # 4. Remove unused imports (like, ilike, users, UnauthorizedError) - will be done manually if needed
  
  cd ../..
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Automated fixes complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now run manual fixes for remaining errors:"
echo "1. console.log → logger"
echo "2. any → proper types"
echo "3. Unused imports"
echo "4. Missing return types"
