# FloodSense AI

## Problem Statement

India’s flood-prone regions need a reliable way to detect flash floods early, share that risk with local communities, and help first responders act before disaster escalates. Existing alert systems are often slow, disconnected, and lack a unified flow from sensors to citizens to command centers.

This project solves that gap by connecting weather data, machine learning, real-time alerts, and rescue response into one working prototype.

## What this project does

FloodSense AI is built to:

- collect weather and hydrology signals from Open-Meteo and local telemetry,
- run a flood risk prediction engine with ML + fallback rules,
- present a citizen-facing dashboard for alerts and evacuation guidance,
- provide a command interface for NDRF / authority operators,
- keep the system working even when one service fails.

## Why this is important

Floods are one of the leading natural disasters in India, affecting millions every year. A practical, real-time platform like FloodSense can reduce response time, help people evacuate safely, and give emergency teams a clear situational picture.

## Solution Overview

FloodSense AI is a three-layer system:

1. **Frontend:** a Next.js dashboard for citizens and NDRF command users.
2. **Backend:** an Express API with Socket.IO for realtime updates and proxying.
3. **AI Cortex:** a Python-based predictive service that combines weather inputs and an ML model.

The frontend does not rely on a single data source. It prefers the backend, falls back to a dedicated AI Cortex, and can still use direct weather API data if needed.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind-style CSS, MapLibre GL, Socket.IO client
- **Backend:** Node.js, Express, Socket.IO, SQLite / Prisma, rate limiting, JWT auth
- **AI Cortex:** Python FastAPI, scikit-learn / XGBoost-style ML, Open-Meteo integration
- **Data:** Open-Meteo free weather API, local telemetry simulation, user reports, alert generation
- **Deployment:** Docker Compose, standalone containers, local dev scripts

## How the build is structured

### Frontend

- `frontend-command/src/app/page.tsx` — entrypoint that switches between citizen and authority experience
- `frontend-command/src/components/AuthPage.tsx` — login/signup flow with OTP-style interaction
- `frontend-command/src/components/CitizenDashboard.tsx` — citizen UI for alerts, evacuation, shelters, and local risk
- `frontend-command/src/components/MapDashboard.tsx` — authority map console with live markers and telemetry
- `frontend-command/src/lib/api.ts` — centralized API client with backend / AI Cortex / fallback logic

### Backend

- `backend/index.ts` — Express API server, health checks, auth flow, risk prediction proxy, mobile and map endpoints
- `backend/prisma.config.ts` — Prisma configuration and schema entrypoint
- `backend/package.json` — dependencies and scripts for build and development

### AI Cortex

- `ai-cortex/main.py` — prediction API endpoints and weather integration
- `ai-cortex/ml/model.py` — risk model and prediction logic
- `ai-cortex/ml/train.py` — training script to generate a model
- `ai-cortex/services/` — weather and alert service helpers

## How to run it

### Local development

```bash
cd floodsense-ai
```

1. Start the AI Cortex service:

```bash
cd ai-cortex
python -m pip install -r requirements.txt
python main.py
```

2. Start the backend API:

```bash
cd ../backend
npm install
npm run dev
```

3. Start the frontend:

```bash
cd ../frontend-command
npm install
npm run dev
```

Open the browser at `http://localhost:3000`.

### Quick start with Docker

```bash
docker-compose up --build
```

If you want a Windows shortcut, use `start.cmd`.

## Expected Impact

FloodSense AI is designed to deliver:

- faster local warnings for citizens during flash floods,
- better coordination for NDRF and district authorities,
- more trustworthy evacuation guidance based on live weather and risk scores,
- resilience through fallback logic when a service becomes unavailable.

It is not just a demo — it is a prototype for a working early-warning system.

## Important details

- The system is built to work even if the backend or AI Cortex becomes unreachable.
- The frontend shows live risk, alerts, evacuation help, SOS triggers, and area dashboards.
- The backend supports both user-facing and map-focused endpoints.
- The AI Cortex can be extended with real river gauge feeds, NDMA alerts, or additional hydrology models.

## Next steps

A human reviewer should verify the following for production readiness:

- real database credentials and access control,
- OTP/security flow with a proper SMS provider,
- live hydrology / river gauge feeds,
- localization to state/district languages,
- mobile-friendly UI polish.

## License

MIT — built to help India become more flood resilient.
