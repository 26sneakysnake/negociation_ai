#!/bin/bash
#
# Quick Setup Script for NegotiAI Coach
# Creates virtual environment and installs all dependencies
#

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 NegotiAI Coach - Quick Setup${NC}"
echo "=================================="
echo ""

# Check Python version
echo -e "${BLUE}Checking Python version...${NC}"
PYTHON_CMD=""

# Try python3 first, then python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    if [ "$(echo "$PYTHON_VERSION >= 3.11" | bc)" -eq 1 ]; then
        PYTHON_CMD="python3"
    fi
fi

if [ -z "$PYTHON_CMD" ] && command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    if [ "$(echo "$PYTHON_VERSION >= 3.11" | bc)" -eq 1 ]; then
        PYTHON_CMD="python"
    fi
fi

if [ -z "$PYTHON_CMD" ]; then
    echo -e "${RED}✗ Python 3.11+ required but not found${NC}"
    echo "Please install Python 3.11 or later"
    exit 1
fi

echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"

# Create virtual environment
echo ""
echo -e "${BLUE}Creating virtual environment...${NC}"

if [ -d "venv" ]; then
    echo -e "${YELLOW}⚠ Virtual environment already exists${NC}"
    read -p "Recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf venv
        $PYTHON_CMD -m venv venv
        echo -e "${GREEN}✓ Virtual environment recreated${NC}"
    fi
else
    $PYTHON_CMD -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo ""
echo -e "${BLUE}Activating virtual environment...${NC}"

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Linux/Mac
    source venv/bin/activate
fi

echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Upgrade pip
echo ""
echo -e "${BLUE}Upgrading pip...${NC}"
pip install --upgrade pip --quiet
echo -e "${GREEN}✓ pip upgraded${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create .env if needed
echo ""
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Don't forget to add your API keys in .env${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Frontend setup (optional)
echo ""
read -p "Install frontend dependencies (requires Node.js)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v npm &> /dev/null; then
        echo -e "${BLUE}Installing frontend dependencies...${NC}"
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠ npm not found, skipping frontend setup${NC}"
    fi
fi

# Summary
echo ""
echo -e "${GREEN}=================================="
echo -e "✓ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit .env and add your API keys"
echo "2. Start the application:"
echo ""
echo -e "${YELLOW}   # Option A: Use the Python starter (recommended)"
echo -e "   python start_simple.py${NC}"
echo ""
echo -e "${YELLOW}   # Option B: Manual activation"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo -e "   venv\\Scripts\\activate"
else
    echo -e "   source venv/bin/activate"
fi
echo -e "   uvicorn backend.main:app --reload${NC}"
echo ""
echo "3. Install browser extension from browser-extension/"
echo ""
echo -e "${GREEN}Happy negotiating! 🎯${NC}"
