#!/bin/bash
# FloodSense-AI — Start All Services

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║         FloodSense-AI v2.0 — Startup            ║"
echo "║    Real-Time Indian Flood Prediction System      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Docker mode
if [ "$1" = "docker" ]; then
    echo "[*] Starting with Docker Compose..."
    docker-compose up --build -d
    echo ""
    echo "[✓] All services started!"
    echo "    Frontend:  http://localhost:3000"
    echo "    Backend:   http://localhost:4000"
    echo "    AI Cortex: http://localhost:8000"
    exit 0
fi

# Start AI Cortex
echo "[1/3] Starting AI Cortex..."
cd ai-cortex && pip install -r requirements.txt -q && python -m uvicorn main:app --reload --port 8000 &
AI_PID=$!
sleep 3

# Start Backend
echo "[2/3] Starting Backend..."
cd ../backend && npm install --silent && npx ts-node index.ts &
BACKEND_PID=$!
sleep 2

# Start Frontend
echo "[3/3] Starting Frontend..."
cd ../frontend-command && npm install --silent && npm run dev &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  All services running!                           ║"
echo "║  Frontend:   http://localhost:3000               ║"
echo "║  Backend:    http://localhost:4000               ║"
echo "║  AI Cortex:  http://localhost:8000               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $AI_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
