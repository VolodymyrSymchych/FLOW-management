#!/bin/bash

# Get root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Ports to check
PORTS=(3000 3001 3002 3003 3004 3005 3006 3007 9091 9092 9093 9095 9096 9097)

echo "Stopping existing processes on ports ${PORTS[@]}..."
for port in "${PORTS[@]}"; do
  pid=$(lsof -t -i :$port)
  if [ ! -z "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid
  fi
done

echo "Starting services..."

# Start Dashboard (Port 3001)
if [ -d "dashboard" ]; then
  cd dashboard && npm run dev > ../dashboard.log 2>&1 &
  echo "Dashboard starting..."
  cd "$ROOT_DIR"
fi

# Start Services
for service_path in services/*-service/; do
  service=$(basename "$service_path")
  if [ -d "$service_path" ]; then
    echo "Starting $service..."
    cd "$service_path" && npm run dev > "../../$service.log" 2>&1 &
    cd "$ROOT_DIR"
  fi
done

echo ""
echo "All services are starting in the background."
echo "Logs are being written to *.log files in the root directory: $ROOT_DIR"
echo "Use 'tail -f *.log' to monitor all logs."
