"""
Flood Risk ML Model — XGBoost-based prediction using real weather features.
Ships with a rule-based fallback if the trained model isn't available.
"""
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

# Feature names used by the model — MUST match train.py exactly (10 features)
FEATURE_NAMES = [
    "rainfall_24h",       # mm in past 24 hours
    "rainfall_7d",        # mm in past 7 days
    "soil_moisture",      # 0-1 fraction
    "river_discharge",    # m³/s (current)
    "max_discharge_7d",   # m³/s (max over 7 days)
    "avg_discharge_7d",   # m³/s (average over 7 days)
    "humidity",           # %
    "temperature",        # °C
    "wind_speed",         # km/h
    "weather_code",       # WMO weather code
]

# Try to load trained model
_model = None

def _load_model():
    global _model
    model_path = os.path.join(os.path.dirname(__file__), "flood_model.joblib")
    if os.path.exists(model_path):
        try:
            import joblib
            _model = joblib.load(model_path)
            logger.info(f"Loaded trained model from {model_path}")
        except Exception as e:
            logger.warning(f"Failed to load model: {e}. Using rule-based fallback.")
            _model = None
    else:
        logger.info("No trained model found. Using rule-based prediction.")

_load_model()


def compute_features(weather: dict, discharge: dict) -> np.ndarray:
    """Build feature vector from real API data. MUST produce 10 features matching train.py."""
    features = [
        weather.get("rainfall_24h", 0),
        weather.get("rainfall_7d", 0),
        weather.get("soil_moisture", 0),
        discharge.get("current_discharge", 0),
        discharge.get("max_discharge_7d", 0),
        discharge.get("avg_discharge_7d", 0),
        weather.get("humidity", 50),
        weather.get("temperature", 25),
        weather.get("wind_speed", 0),
        weather.get("weather_code", 0),
    ]
    return np.array(features).reshape(1, -1)


def predict_risk(weather: dict, discharge: dict) -> dict:
    """Predict flood risk from weather and discharge data."""
    features = compute_features(weather, discharge)

    if _model is not None:
        try:
            # XGBRegressor returns a float in [0, 1] — NOT predict_proba
            raw = float(_model.predict(features)[0])
            probability = min(1.0, max(0.0, raw))
        except Exception as e:
            logger.warning(f"Model prediction failed: {e}. Falling back to rules.")
            probability = _rule_based_risk(features[0])
    else:
        probability = _rule_based_risk(features[0])

    # Classify
    if probability >= 0.75:
        risk_level = "SEVERE"
        recommendation = "Immediate evacuation recommended. Contact NDRF helpline 1078."
    elif probability >= 0.5:
        risk_level = "HIGH"
        recommendation = "Prepare for possible flooding. Move valuables to higher ground."
    elif probability >= 0.25:
        risk_level = "MODERATE"
        recommendation = "Stay alert. Monitor weather updates and river levels."
    else:
        risk_level = "LOW"
        recommendation = "No immediate flood risk. Continue routine monitoring."

    # Contributing factors
    factors = _get_contributing_factors(features[0])

    return {
        "risk_level": risk_level,
        "probability": round(probability, 3),
        "risk_score": round(probability * 10, 1),
        "contributing_factors": factors,
        "recommendation": recommendation,
        "model": "trained" if _model else "rule-based",
        "features_used": dict(zip(FEATURE_NAMES, features[0].tolist())),
    }


def _rule_based_risk(features: np.ndarray) -> float:
    """Physics-informed rule-based risk when no trained model is available."""
    rainfall_24h = features[0]
    rainfall_7d = features[1]
    soil_moisture = features[2]
    river_discharge = features[3]

    score = 0.0

    # Rainfall intensity (most important factor)
    if rainfall_24h > 200:
        score += 0.4
    elif rainfall_24h > 100:
        score += 0.3
    elif rainfall_24h > 50:
        score += 0.2
    elif rainfall_24h > 20:
        score += 0.1

    # Cumulative rainfall
    if rainfall_7d > 500:
        score += 0.25
    elif rainfall_7d > 200:
        score += 0.15
    elif rainfall_7d > 100:
        score += 0.08

    # Soil saturation (amplifies flood risk)
    if soil_moisture > 0.8:
        score += 0.2
    elif soil_moisture > 0.5:
        score += 0.1

    # River discharge
    if river_discharge > 5000:
        score += 0.15
    elif river_discharge > 1000:
        score += 0.08
    elif river_discharge > 100:
        score += 0.03

    return min(1.0, max(0.0, score))


def _get_contributing_factors(features: np.ndarray) -> list:
    """Identify top contributing factors for explainability."""
    factors = []
    if features[0] > 50:
        factors.append({"factor": "Heavy Rainfall (24h)", "value": f"{features[0]:.1f}mm", "impact": "HIGH"})
    if features[1] > 200:
        factors.append({"factor": "Cumulative Rainfall (7d)", "value": f"{features[1]:.1f}mm", "impact": "HIGH"})
    if features[2] > 0.7:
        factors.append({"factor": "Soil Saturation", "value": f"{features[2]*100:.0f}%", "impact": "HIGH"})
    if features[3] > 1000:
        factors.append({"factor": "River Discharge", "value": f"{features[3]:.0f} m³/s", "impact": "HIGH"})
    if features[0] > 20:
        factors.append({"factor": "Moderate Rainfall", "value": f"{features[0]:.1f}mm", "impact": "MODERATE"})
    if features[2] > 0.4:
        factors.append({"factor": "Elevated Soil Moisture", "value": f"{features[2]*100:.0f}%", "impact": "MODERATE"})
    if not factors:
        factors.append({"factor": "Normal Conditions", "value": "All parameters within safe range", "impact": "LOW"})
    return factors[:5]
