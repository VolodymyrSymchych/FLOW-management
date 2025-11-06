#!/bin/bash
# Setup script for Project Scope Analyzer

echo "🎯 Project Scope Analyzer - Setup"
echo "=================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Found Python $python_version"
echo ""

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Setup .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your ANTHROPIC_API_KEY"
    echo "   Get your key from: https://console.anthropic.com/"
else
    echo "✓ .env file already exists"
fi
echo ""

# Create reports directory
if [ ! -d "reports" ]; then
    mkdir reports
    echo "✓ Created reports directory"
else
    echo "✓ Reports directory exists"
fi
echo ""

echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Add your API key to .env file"
echo "2. Activate the virtual environment: source venv/bin/activate"
echo "3. Run an example: python main.py analyze examples/good_scope_example.md"
echo "4. Or use: ./run_example.sh"
echo ""
echo "For help: python main.py --help"
echo ""

