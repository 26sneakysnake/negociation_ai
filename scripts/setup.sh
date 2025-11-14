#!/bin/bash

echo "🎯 NegotiAI Coach - Setup Script"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys!"
    echo ""
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Install Python dependencies (for local development)
echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Node dependencies
echo ""
echo "Installing Node dependencies..."
cd frontend && npm install && cd ..

# Load knowledge base
echo ""
echo "Loading negotiation knowledge base..."
python backend/knowledge/loader.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Run: docker-compose up -d"
echo "3. Access the app at http://localhost:3000"
echo "4. Access API docs at http://localhost:8000/docs"
echo "5. Access N8N at http://localhost:5678 (admin/admin)"
