#!/bin/bash

# Get root directory
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Monitoring all service logs..."
tail -f *.log
