#!/usr/bin/env bash
# Start all services required for the Flow dashboard (development)
# Run from project root: ./scripts/start-dev.sh

set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Flow Development Startup ==="
echo "Starting services on separate ports. Use separate terminals or tmux."
echo ""

# Check for .env
if [ ! -f apps/dashboard/.env ]; then
  echo "⚠️  apps/dashboard/.env not found. Copy from apps/dashboard/.env.example and configure:"
  echo "   cp apps/dashboard/.env.example apps/dashboard/.env"
  echo ""
fi

echo "Required services (start each in its own terminal):"
echo ""
echo "1. Auth (port 3002):     cd services/auth-service && PORT=3002 npm run dev"
echo "2. User (port 3003):     cd services/user-service && PORT=3003 npm run dev"
echo "3. Project (port 3004):  cd services/project-service && PORT=3004 npm run dev"
echo "4. Task (port 3005):     cd services/task-service && PORT=3005 npm run dev"
echo "5. Team (port 3006):     cd services/team-service && PORT=3006 npm run dev"
echo "6. Dashboard (port 3001): cd apps/dashboard && npm run dev"
echo ""
echo "Minimum for dashboard (projects/tasks/teams): 2, 3, 4, 5, 6"
echo "For login/signup: also start 1"
echo ""
echo "Ensure DATABASE_URL and JWT_SECRET are set in apps/dashboard/.env"
echo ""

# Optionally start dashboard if nothing on 3001
if ! lsof -i :3001 -P -n 2>/dev/null | grep -q LISTEN; then
  echo "Starting dashboard on port 3001..."
  cd apps/dashboard && npm run dev
else
  echo "Port 3001 already in use. Dashboard may already be running."
  echo "Visit http://localhost:3001"
fi
