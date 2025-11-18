#!/bin/bash

# Deployment script for microservices
# This script deploys services using Docker Compose

set -e

ENVIRONMENT=${1:-development}
COMPOSE_FILE="infrastructure/docker-compose.yml"

echo "Deploying microservices to $ENVIRONMENT environment..."

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    exit 1
fi

# Build and start services
cd "$(dirname "$0")/.."

echo "Building Docker images..."
docker-compose -f $COMPOSE_FILE build

echo "Starting services..."
docker-compose -f $COMPOSE_FILE up -d

echo "Waiting for services to be healthy..."
sleep 10

# Health check
echo "Checking service health..."
docker-compose -f $COMPOSE_FILE ps

echo "Deployment complete!"

