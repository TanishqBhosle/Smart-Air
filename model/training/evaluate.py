"""Evaluation metrics and comparative analysis for SmartAir forecasting models.
Matches notebook Section 10 and Section 11.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any


def regression_metrics(actual: np.ndarray, predicted: np.ndarray) -> Dict[str, float]:
    """Calculate MAE, MSE, RMSE, and R2 regression metrics."""
    mse = float(mean_squared_error(actual, predicted))
    mae = float(mean_absolute_error(actual, predicted))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(actual, predicted))
    return {
        "MAE": round(mae, 4),
        "MSE": round(mse, 4),
        "RMSE": round(rmse, 4),
        "R2": round(r2, 4)
    }


def aqi_band(v: float) -> str:
    """Classify AQI values into descriptive bands for error analysis."""
    if v <= 50:
        return "Good (0-50)"
    if v <= 100:
        return "Satisfactory (51-100)"
    if v <= 200:
        return "Moderate (101-200)"
    if v <= 300:
        return "Poor (201-300)"
    if v <= 400:
        return "Very Poor (301-400)"
    return "Severe (>400)"


def compute_band_breakdown(actual: np.ndarray, predicted: np.ndarray) -> pd.DataFrame:
    """Break down prediction error across the Indian AQI bands."""
    df = pd.DataFrame({
        "Actual AQI": actual,
        "Predicted AQI": predicted,
        "Absolute Error": np.abs(actual - predicted)
    })
    df["Actual AQI Band"] = df["Actual AQI"].map(aqi_band)
    
    breakdown = df.groupby("Actual AQI Band").agg(
        Samples=("Absolute Error", "size"),
        MAE=("Absolute Error", "mean"),
        Mean_Actual_AQI=("Actual AQI", "mean"),
        Mean_Predicted_AQI=("Predicted AQI", "mean")
    ).round(2).reset_index()
    
    return breakdown

