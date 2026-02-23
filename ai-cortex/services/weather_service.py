"""
Weather Service — fetches real-time rainfall, soil moisture, temperature
from Open-Meteo API (free, no API key needed).
"""
import httpx
from datetime import datetime

OPEN_METEO_BASE = "https://api.open-meteo.com/v1"


async def get_current_weather(lat: float, lon: float) -> dict:
    """Fetch current weather + hourly forecast for a location."""
    url = f"{OPEN_METEO_BASE}/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m",
        "hourly": "precipitation,soil_moisture_0_to_1cm,temperature_2m",
        "daily": "precipitation_sum,rain_sum",
        "timezone": "Asia/Kolkata",
        "forecast_days": 3,
        "past_days": 7,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current", {})
    hourly = data.get("hourly", {})
    daily = data.get("daily", {})

    precip_hourly = hourly.get("precipitation", [])
    soil_moisture_hourly = hourly.get("soil_moisture_0_to_1cm", [])

    # Past 24h rainfall (7 past days * 24 = 168 past hours, + 3 forecast days * 24 = 72)
    total_hours = len(precip_hourly)
    now_idx = total_hours - 72  # end of past data
    past_24h = precip_hourly[max(0, now_idx - 24):now_idx] if now_idx > 0 else []
    rainfall_24h = sum(p for p in past_24h if p is not None)

    past_7d = precip_hourly[max(0, now_idx - 168):now_idx] if now_idx > 0 else []
    rainfall_7d = sum(p for p in past_7d if p is not None)

    valid_sm = [s for s in soil_moisture_hourly if s is not None]
    soil_moisture = valid_sm[-1] if valid_sm else 0.0

    return {
        "lat": lat,
        "lon": lon,
        "temperature": current.get("temperature_2m", 0),
        "humidity": current.get("relative_humidity_2m", 0),
        "current_precipitation": current.get("precipitation", 0),
        "current_rain": current.get("rain", 0),
        "wind_speed": current.get("wind_speed_10m", 0),
        "weather_code": current.get("weather_code", 0),
        "rainfall_24h": round(rainfall_24h, 1),
        "rainfall_7d": round(rainfall_7d, 1),
        "soil_moisture": round(soil_moisture, 4),
        "daily_precipitation": daily.get("precipitation_sum", []),
        "daily_dates": daily.get("time", []),
        "source": "Open-Meteo",
        "timestamp": datetime.now().isoformat(),
    }


async def get_river_discharge(lat: float, lon: float) -> dict:
    """Fetch river discharge data from Open-Meteo Flood API."""
    url = "https://flood-api.open-meteo.com/v1/flood"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "river_discharge",
        "past_days": 7,
        "forecast_days": 3,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        daily = data.get("daily", {})
        discharges = daily.get("river_discharge", [])
        dates = daily.get("time", [])
        valid = [d for d in discharges if d is not None]

        return {
            "lat": lat,
            "lon": lon,
            "current_discharge": valid[-1] if valid else 0.0,
            "max_discharge_7d": max(valid) if valid else 0.0,
            "avg_discharge_7d": round(sum(valid) / len(valid), 2) if valid else 0.0,
            "discharge_trend": discharges,
            "dates": dates,
            "source": "Open-Meteo Flood API",
        }
    except Exception as e:
        return {
            "lat": lat, "lon": lon,
            "current_discharge": 0.0, "max_discharge_7d": 0.0,
            "avg_discharge_7d": 0.0, "discharge_trend": [], "dates": [],
            "source": "unavailable", "error": str(e),
        }
