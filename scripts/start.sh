#!/bin/bash

echo "🚀 Starting NegotiAI Coach..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Run ./scripts/setup.sh first."
    exit 1
fi

# Start with Docker Compose
echo "Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check services
echo ""
echo "Checking service health..."

# Backend
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend: http://localhost:8000"
else
    echo "⚠️  Backend not ready yet..."
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: http://localhost:3000"
else
    echo "⚠️  Frontend not ready yet..."
fi

# Qdrant
if curl -s http://localhost:6333 > /dev/null; then
    echo "✅ Qdrant: http://localhost:6333"
else
    echo "⚠️  Qdrant not ready yet..."
fi

# N8N
if curl -s http://localhost:5678 > /dev/null; then
    echo "✅ N8N: http://localhost:5678"
else
    echo "⚠️  N8N not ready yet..."
fi

echo ""
echo "🎯 NegotiAI Coach is starting!"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8000/docs"
echo "  N8N:      http://localhost:5678 (admin/admin)"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop:      docker-compose down"
