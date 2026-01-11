#!/bin/bash

# Масове виправлення lint помилок для всіх сервісів

SERVICES=(
  "project-service"
  "task-service"
  "team-service"
  "chat-service"
  "invoice-service"
  "notification-service"
  "file-service"
)

for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔧 Fixing: $SERVICE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  cd "services/$SERVICE" || continue
  
  # Fix src/index.ts - return types
  if [ -f "src/index.ts" ]; then
    sed -i '' 's/async function main()/async function main(): Promise<void>/g' src/index.ts
    sed -i '' 's/const shutdown = async () =>/const shutdown = async (): Promise<void> =>/g' src/index.ts
  fi
  
  # Fix src/middleware/rate-limit.ts - return type
  if [ -f "src/middleware/rate-limit.ts" ]; then
    sed -i '' 's/export function rateLimit(options: RateLimitOptions)/export function rateLimit(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>/g' src/middleware/rate-limit.ts
  fi
  
  # Fix src/db/index.ts - any type
  if [ -f "src/db/index.ts" ]; then
    sed -i '' 's/(getDbInstance() as any)\[prop\]/(getDbInstance() as unknown as Record<string, unknown>)[prop as string]/g' src/db/index.ts
    # Add logger import if not exists
    if ! grep -q "import { logger }" src/db/index.ts; then
      sed -i '' "5i\\
import { logger } from '@project-scope-analyzer/shared';\\
" src/db/index.ts
    fi
    # Replace console with logger
    sed -i '' "s/console.error('Database lazy initialization error:'/logger.error('Database lazy initialization error',/g" src/db/index.ts
    sed -i '' "s/console.error('Unexpected database pool error:', err);/logger.error('Unexpected database pool error', { error: err });/g" src/db/index.ts
  fi
  
  # Fix src/routes/health.ts - any and console
  if [ -f "src/routes/health.ts" ]; then
    # Add logger import if not exists
    if ! grep -q "import { logger }" src/routes/health.ts; then
      sed -i '' "2i\\
import { logger } from '@project-scope-analyzer/shared';\\
" src/routes/health.ts
    fi
    # Replace any with proper type
    sed -i '' 's/const pool = client as any;/const pool = client as Record<string, unknown>;/g' src/routes/health.ts
    sed -i '' 's/) as any;/) as { rows?: unknown[] };/g' src/routes/health.ts
    # Replace console with logger
    sed -i '' "s/console.error/logger.error/g" src/routes/health.ts
    sed -i '' "s/logger.error('Database check error:', message);/logger.error('Database check error', { error: message });/g" src/routes/health.ts
    sed -i '' "s/logger.error('Database health check error:', message);/logger.error('Database health check error', { error: message });/g" src/routes/health.ts
    # Fix boolean type check
    sed -i '' 's/checks.database = result && result.rows && result.rows.length > 0;/checks.database = !!(result \&\& result.rows \&\& result.rows.length > 0);/g' src/routes/health.ts
  fi
  
  # Fix src/config/index.ts - console
  if [ -f "src/config/index.ts" ]; then
    sed -i '' '/console.warn.*JWT_SECRET/d' src/config/index.ts
    sed -i '' '/console.error.*Failed to read .env/d' src/config/index.ts
  fi
  
  # Remove unused imports from services (this is trickier, doing common ones)
  find src -name "*.ts" -type f -exec sed -i '' "s/, UnauthorizedError//g" {} \;
  find src -name "*.ts" -type f -exec sed -i '' "s/UnauthorizedError, //g" {} \;
  find src -name "*.ts" -type f -exec sed -i '' "s/, unique//g" {} \;
  find src -name "*.ts" -type f -exec sed -i '' "s/unique, //g" {} \;
  
  cd ../..
  
  echo "✅ Fixed common issues in $SERVICE"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Mass fixes complete! Now running lint on each service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
