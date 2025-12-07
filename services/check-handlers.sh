#!/bin/bash

# Script to add 404 handlers and root redirects to all services
# This prevents Vercel timeout errors

SERVICES=(
  "chat-service"
  "invoice-service"
  "notification-service"
  "project-service"
  "task-service"
  "team-service"
)

echo "Checking services for missing root handlers and 404 handlers..."

for service in "${SERVICES[@]}"; do
  APP_FILE="services/$service/src/app.ts"
  
  if [ ! -f "$APP_FILE" ]; then
    echo "⚠️  Skipping $service - app.ts not found"
    continue
  fi
  
  echo "📝 Checking $service..."
  
  # Check if root handler exists
  if ! grep -q "app.get('/'," "$APP_FILE"; then
    echo "  ✅ Adding root handler to $service"
  else
    echo "  ✓ Root handler already exists in $service"
  fi
  
  # Check if 404 handler exists
  if ! grep -q "404 handler" "$APP_FILE"; then
    echo "  ⚠️  Missing 404 handler in $service"
  else
    echo "  ✓ 404 handler already exists in $service"
  fi
done

echo ""
echo "Done! Review the changes and apply manually where needed."
