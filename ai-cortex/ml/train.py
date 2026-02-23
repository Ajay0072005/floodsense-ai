"""
FloodSense ML Model Training Script
Trains an XGBoost model on synthetic data patterned after INDOFLOODS dataset.
Run: python ml/train.py
"""
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "flood_model.joblib")

def generate_training_data(n_samples: int = 5000) -> tuple:
    """Generate synthetic flood data modeled on Indian flood patterns."""
    np.random.seed(42)
    
    # Features: rainfall_24h, rainfall_7d, soil_moisture, discharge, max_discharge_7d,
    #           avg_discharge_7d, humidity, temperature, wind_speed, weather_code
    
    X = np.zeros((n_samples, 10))
    y = np.zeros(n_samples)
    
    for i in range(n_samples):
        # Simulate seasonal patterns (monsoon vs dry)
        is_monsoon = np.random.random() < 0.4
        
        if is_monsoon:
            rainfall_24h = np.random.exponential(30) + np.random.uniform(5, 20)
            rainfall_7d = rainfall_24h * np.random.uniform(3, 7)
            soil_moisture = np.random.uniform(0.5, 0.95)
            discharge = np.random.exponential(200) + 50
            humidity = np.random.uniform(70, 98)
            temperature = np.random.uniform(22, 35)
        else:
            rainfall_24h = np.random.exponential(5)
            rainfall_7d = rainfall_24h * np.random.uniform(1, 4)
            soil_moisture = np.random.uniform(0.1, 0.5)
            discharge = np.random.exponential(50) + 10
            humidity = np.random.uniform(30, 70)
            temperature = np.random.uniform(15, 42)
        
        max_discharge_7d = discharge * np.random.uniform(1.0, 2.5)
        avg_discharge_7d = discharge * np.random.uniform(0.6, 1.0)
        wind_speed = np.random.uniform(0, 40)
        weather_code = np.random.choice([0, 1, 2, 3, 51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99])
        
        X[i] = [rainfall_24h, rainfall_7d, soil_moisture, discharge,
                max_discharge_7d, avg_discharge_7d, humidity, temperature,
                wind_speed, weather_code]
        
        # Compute flood probability based on physics
        risk = 0.0
        risk += min(rainfall_24h / 100, 1.0) * 3.0      # Rainfall impact
        risk += min(rainfall_7d / 400, 1.0) * 2.0        # Cumulative rain
        risk += soil_moisture * 2.5                        # Saturated soil
        risk += min(discharge / 500, 1.0) * 2.0           # River discharge
        risk += (humidity / 100) * 0.5                     # Humidity
        
        # Heavy rain weather codes increase risk
        if weather_code in [63, 65, 82, 95, 96, 99]:
            risk += 1.5
        elif weather_code in [53, 55, 61, 80, 81]:
            risk += 0.5
        
        # Normalize to 0-1
        y[i] = min(max(risk / 10.0, 0.0), 1.0)
        # Add small noise
        y[i] = min(max(y[i] + np.random.normal(0, 0.05), 0.0), 1.0)
    
    return X, y


def train_model():
    """Train XGBoost model and save to disk."""
    try:
        from xgboost import XGBRegressor
        from joblib import dump
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import mean_absolute_error, r2_score
    except ImportError:
        logger.warning("ML dependencies not installed. Run: pip install xgboost scikit-learn joblib")
        return False
    
    logger.info("Generating training data (5000 samples)...")
    X, y = generate_training_data(5000)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    logger.info("Training XGBoost model...")
    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    logger.info(f"Model Performance — MAE: {mae:.4f}, R²: {r2:.4f}")
    
    # Feature importance
    feature_names = [
        "rainfall_24h", "rainfall_7d", "soil_moisture", "discharge",
        "max_discharge_7d", "avg_discharge_7d", "humidity", "temperature",
        "wind_speed", "weather_code"
    ]
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    
    logger.info("Feature Importance:")
    for idx in sorted_idx[:5]:
        logger.info(f"  {feature_names[idx]}: {importances[idx]:.4f}")
    
    # Save model
    dump(model, MODEL_PATH)
    logger.info(f"Model saved to {MODEL_PATH}")
    
    return True


if __name__ == "__main__":
    success = train_model()
    if success:
        print("\n✅ Model trained and saved successfully!")
        print(f"   Path: {MODEL_PATH}")
    else:
        print("\n⚠️ Training failed — check dependencies")
