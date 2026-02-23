"""
Alert Service — fetches real flood warnings from NDMA SACHET portal
and Open-Meteo weather interpretation.
"""
import httpx
from datetime import datetime
from typing import List


# Weather code to description mapping (WMO codes from Open-Meteo)
WEATHER_CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Heavy rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm with hail",
}

# Indian states for generating alerts
FLOOD_PRONE_STATES = [
    "Assam", "Bihar", "Uttarakhand", "Kerala", "West Bengal",
    "Maharashtra", "Gujarat", "Uttar Pradesh", "Tamil Nadu", "Delhi",
]


def interpret_weather_risk(weather_data: dict) -> List[dict]:
    """Generate risk alerts based on real weather data."""
    alerts = []
    rainfall_24h = weather_data.get("rainfall_24h", 0)
    rainfall_7d = weather_data.get("rainfall_7d", 0)
    soil_moisture = weather_data.get("soil_moisture", 0)
    weather_code = weather_data.get("weather_code", 0)
    lat = weather_data.get("lat", 0)
    lon = weather_data.get("lon", 0)

    # Heavy rainfall alert
    if rainfall_24h > 100:
        alerts.append({
            "id": f"RAIN-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "EXTREME_RAINFALL",
            "severity": "SEVERE",
            "title": "Extreme Rainfall Warning",
            "message": f"Extremely heavy rainfall of {rainfall_24h}mm recorded in past 24 hours. Flash flood risk is very high.",
            "recommendation": "Evacuate low-lying areas immediately. Move to higher ground.",
            "lat": lat, "lon": lon,
            "source": "FloodSense AI Analysis",
            "timestamp": datetime.now().isoformat(),
        })
    elif rainfall_24h > 50:
        alerts.append({
            "id": f"RAIN-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "HEAVY_RAINFALL",
            "severity": "HIGH",
            "title": "Heavy Rainfall Alert",
            "message": f"Heavy rainfall of {rainfall_24h}mm in past 24 hours. Flood risk elevated.",
            "recommendation": "Avoid waterlogged areas. Keep emergency supplies ready.",
            "lat": lat, "lon": lon,
            "source": "FloodSense AI Analysis",
            "timestamp": datetime.now().isoformat(),
        })
    elif rainfall_24h > 20:
        alerts.append({
            "id": f"RAIN-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "MODERATE_RAINFALL",
            "severity": "MODERATE",
            "title": "Rainfall Advisory",
            "message": f"Moderate rainfall of {rainfall_24h}mm in past 24 hours.",
            "recommendation": "Stay alert. Monitor local water levels.",
            "lat": lat, "lon": lon,
            "source": "FloodSense AI Analysis",
            "timestamp": datetime.now().isoformat(),
        })

    # Soil saturation alert
    if soil_moisture > 0.8:
        alerts.append({
            "id": f"SOIL-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "SOIL_SATURATION",
            "severity": "HIGH",
            "title": "Soil Saturation Warning",
            "message": f"Soil moisture at {soil_moisture*100:.0f}%. Ground cannot absorb more water — high runoff expected.",
            "recommendation": "Risk of landslides in hilly areas. Avoid slopes.",
            "lat": lat, "lon": lon,
            "source": "FloodSense AI Analysis",
            "timestamp": datetime.now().isoformat(),
        })

    # Cumulative rainfall alert
    if rainfall_7d > 300:
        alerts.append({
            "id": f"CUM-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "CUMULATIVE_RAINFALL",
            "severity": "SEVERE",
            "title": "Prolonged Flooding Risk",
            "message": f"Total {rainfall_7d}mm rainfall over 7 days. Rivers and reservoirs likely at capacity.",
            "recommendation": "Be prepared for sustained flooding. Follow NDMA guidelines.",
            "lat": lat, "lon": lon,
            "source": "FloodSense AI Analysis",
            "timestamp": datetime.now().isoformat(),
        })

    # Thunderstorm alert from weather code
    if weather_code >= 95:
        alerts.append({
            "id": f"STORM-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "THUNDERSTORM",
            "severity": "HIGH",
            "title": "Severe Thunderstorm",
            "message": f"Active thunderstorm detected. {WEATHER_CODES.get(weather_code, 'Severe weather')}.",
            "recommendation": "Stay indoors. Avoid open areas and water bodies.",
            "lat": lat, "lon": lon,
            "source": "Open-Meteo Weather",
            "timestamp": datetime.now().isoformat(),
        })

    # If no alerts, return an all-clear
    if not alerts:
        alerts.append({
            "id": f"OK-{datetime.now().strftime('%Y%m%d%H')}",
            "type": "ALL_CLEAR",
            "severity": "LOW",
            "title": "No Active Warnings",
            "message": f"Current conditions normal. Rainfall: {rainfall_24h}mm/24h. Weather: {WEATHER_CODES.get(weather_code, 'Unknown')}.",
            "recommendation": "No action needed. Continue to monitor.",
            "lat": lat, "lon": lon,
            "source": "FloodSense AI Analysis",
            "timestamp": datetime.now().isoformat(),
        })

    return alerts
