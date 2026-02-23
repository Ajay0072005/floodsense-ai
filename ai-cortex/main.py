"""
FloodSense AI Cortex — Real-time flood risk prediction API.
Integrates Open-Meteo weather data with ML-based risk prediction.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging

from services.weather_service import get_current_weather, get_river_discharge
from services.alert_service import interpret_weather_risk
from ml.model import predict_risk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FloodSense AI Cortex",
    description="Real-time flood risk prediction using Open-Meteo weather data and ML models",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────

class PredictRequest(BaseModel):
    lat: float
    lon: float
    district_name: Optional[str] = None
    state_name: Optional[str] = None


class TranslationRequest(BaseModel):
    text: str
    target_lang: str


# ─── Health ───────────────────────────────────────────

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AI Cortex v2.0 — Real Data", "apis": ["Open-Meteo", "NDMA SACHET"]}


# ─── Core Prediction Endpoint ────────────────────────

@app.post("/predict")
async def predict_flood_risk(req: PredictRequest):
    """
    Main prediction endpoint. Fetches real weather data,
    computes ML features, and returns risk assessment.
    """
    try:
        # Fetch real weather data from Open-Meteo
        weather = await get_current_weather(req.lat, req.lon)
        logger.info(f"Weather for ({req.lat},{req.lon}): rain_24h={weather['rainfall_24h']}mm, soil={weather['soil_moisture']}")

        # Fetch river discharge data
        discharge = await get_river_discharge(req.lat, req.lon)
        logger.info(f"Discharge for ({req.lat},{req.lon}): {discharge['current_discharge']} m³/s")

        # ML prediction
        risk = predict_risk(weather, discharge)

        # Generate alerts based on weather
        alerts = interpret_weather_risk(weather)

        return {
            "status": "success",
            "location": {
                "lat": req.lat,
                "lon": req.lon,
                "district": req.district_name,
                "state": req.state_name,
            },
            "risk": risk,
            "weather": weather,
            "discharge": discharge,
            "alerts": alerts,
        }

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ─── Weather Endpoint ────────────────────────────────

@app.get("/weather")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Fetch real-time weather for a location."""
    try:
        weather = await get_current_weather(lat, lon)
        return {"status": "success", "data": weather}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── River Discharge ─────────────────────────────────

@app.get("/discharge")
async def get_discharge(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Fetch river discharge data for a location."""
    try:
        discharge = await get_river_discharge(lat, lon)
        return {"status": "success", "data": discharge}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Alerts ──────────────────────────────────────────

@app.get("/alerts")
async def get_alerts(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Get flood alerts for a location based on current weather."""
    try:
        weather = await get_current_weather(lat, lon)
        alerts = interpret_weather_risk(weather)
        return {"status": "success", "alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Bulk Predict (for map) ──────────────────────────

class BulkPredictRequest(BaseModel):
    locations: List[PredictRequest]


@app.post("/predict/bulk")
async def predict_bulk(req: BulkPredictRequest):
    """Predict risk for multiple locations at once (for map visualization)."""
    results = []
    for loc in req.locations[:50]:  # Cap at 50 to avoid overload
        try:
            weather = await get_current_weather(loc.lat, loc.lon)
            discharge = await get_river_discharge(loc.lat, loc.lon)
            risk = predict_risk(weather, discharge)
            results.append({
                "lat": loc.lat,
                "lon": loc.lon,
                "district": loc.district_name,
                "state": loc.state_name,
                "risk_level": risk["risk_level"],
                "risk_score": risk["risk_score"],
                "probability": risk["probability"],
                "rainfall_24h": weather["rainfall_24h"],
            })
        except Exception as e:
            results.append({
                "lat": loc.lat, "lon": loc.lon,
                "district": loc.district_name,
                "error": str(e),
            })
    return {"status": "success", "results": results}


# ─── Translation (keep existing) ─────────────────────

@app.post("/translate/mock")
def translate_mock(req: TranslationRequest):
    return {
        "original": req.text,
        "translated": f"[{req.target_lang}] {req.text}",
        "language": req.target_lang,
    }
