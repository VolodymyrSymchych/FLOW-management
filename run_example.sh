#!/bin/bash
# Quick example run script for Project Scope Analyzer

echo "🎯 Project Scope Analyzer - Example Analysis"
echo "=============================================="
echo ""

# Check if virtual environment is activated
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo "⚠️  Virtual environment not activated!"
    echo "Run: source venv/bin/activate"
    echo ""
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Copy .env.example to .env and add your ANTHROPIC_API_KEY"
    echo ""
    exit 1
fi

echo "Running example analyses..."
echo ""

echo "1️⃣  Analyzing GOOD scope example (should score 80-95)..."
python main.py analyze examples/good_scope_example.md \
  --name "Customer Portal Enhancement" \
  --type "web application" \
  --industry "financial services" \
  --team-size "5 developers, 1 designer, 1 PM, 1 QA" \
  --timeline "12 weeks" \
  --output reports/good_scope_analysis.md

echo ""
echo "✅ Good scope analysis complete!"
echo ""
echo "2️⃣  Analyzing POOR scope example (should score 20-45)..."
python main.py analyze examples/poor_scope_example.md \
  --name "E-Commerce Platform" \
  --type "e-commerce" \
  --quick \
  --output reports/poor_scope_analysis.md

echo ""
echo "✅ Poor scope analysis complete!"
echo ""
echo "3️⃣  Analyzing MEDIUM scope example (should score 50-75)..."
python main.py analyze examples/medium_scope_example.md \
  --name "Employee Directory" \
  --type "internal web app" \
  --team-size "3 developers, 1 designer" \
  --timeline "8 weeks" \
  --quick \
  --output reports/medium_scope_analysis.md

echo ""
echo "✅ Medium scope analysis complete!"
echo ""
echo "================================================"
echo "🎉 All analyses complete! Check the reports/ directory"
echo "================================================"

