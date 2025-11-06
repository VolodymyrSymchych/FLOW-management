#!/bin/bash

# Start Project Scope Analyzer Dashboard
# This script starts both the Flask backend and Next.js frontend

echo "🚀 Starting Project Scope Analyzer Dashboard"
echo ""

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  Warning: ANTHROPIC_API_KEY environment variable is not set"
    echo "Please set it with: export ANTHROPIC_API_KEY=your_key_here"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start Flask backend in background
echo "📡 Starting Flask backend on http://localhost:5000..."
python3 api.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 2

# Check if dashboard directory exists
if [ ! -d "dashboard" ]; then
    echo "❌ Error: dashboard directory not found"
    kill $BACKEND_PID
    exit 1
fi

# Start Next.js frontend
echo ""
echo "🎨 Starting Next.js frontend on http://localhost:3000..."
cd dashboard

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Next.js
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Dashboard is starting up!"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Handle Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Wait for processes
wait
