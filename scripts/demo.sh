#!/bin/bash

echo "🎬 Running NegotiAI Coach Demo Scenario"
echo "========================================"
echo ""

# Check if backend is running
if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo "⚠️  Backend not running. Starting services..."
    ./scripts/start.sh
    sleep 15
fi

echo "Running SaaS B2B negotiation scenario..."
echo ""

python demo/run_scenario.py

echo ""
echo "✅ Demo complete!"
echo ""
echo "To run a live session:"
echo "1. Open http://localhost:3000"
echo "2. Complete the preparation steps"
echo "3. Start a live negotiation session"
