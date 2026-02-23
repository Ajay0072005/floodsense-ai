@echo off
title FloodSense-AI — Starting All Services
color 0B

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║         FloodSense-AI v2.0 — Startup            ║
echo  ║    Real-Time Indian Flood Prediction System      ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: Check if running with Docker
if "%1"=="docker" (
    echo [*] Starting with Docker Compose...
    docker-compose up --build -d
    echo.
    echo [✓] All services started!
    echo     Frontend:  http://localhost:3000
    echo     Backend:   http://localhost:4000
    echo     AI Cortex: http://localhost:8000
    echo.
    pause
    exit /b
)

echo [1/3] Starting AI Cortex (Python ML Engine)...
start "AI Cortex" cmd /k "cd /d %~dp0ai-cortex && pip install -r requirements.txt -q && python -m uvicorn main:app --reload --port 8000"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Backend API (Node.js)...
start "Backend API" cmd /k "cd /d %~dp0backend && npm install --silent && npx ts-node index.ts"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (Next.js)...
start "Frontend" cmd /k "cd /d %~dp0frontend-command && npm install --silent && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║  All services starting! Open in browser:        ║
echo  ║                                                  ║
echo  ║  Frontend:   http://localhost:3000               ║
echo  ║  Backend:    http://localhost:4000/health         ║
echo  ║  AI Cortex:  http://localhost:8000/health         ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: Open browser
timeout /t 8 /nobreak >nul
start http://localhost:3000

pause
