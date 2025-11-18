#!/bin/bash

# Script to generate nginx configuration for microservices
# This script can be extended to dynamically generate nginx config based on running services

set -e

NGINX_CONF_DIR="infrastructure/nginx/conf.d"
SERVICES_FILE="services.txt"

echo "Generating Nginx configuration for microservices..."

# Create services file if it doesn't exist
if [ ! -f "$SERVICES_FILE" ]; then
    cat > "$SERVICES_FILE" << EOF
auth-service:3000
user-service:3000
project-service:3000
task-service:3000
team-service:3000
chat-service:3000
financial-service:3000
file-service:3000
time-service:3000
notification-service:3000
analytics-service:3000
ai-service:3000
EOF
fi

echo "Nginx configuration generation complete."
echo "Note: Main nginx.conf is manually maintained. This script can be extended for dynamic generation."

