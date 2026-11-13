"""Prediction schemas.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    station_id: str = Field(..., description="Unique monitoring station ID, e.g. 'DL001'")
    prediction_date: str = Field(..., description="Target date for AQI forecast in YYYY-MM-DD format")


class DailyObservation(BaseModel):
    date: str
    aqi: float
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    aqi_category: Optional[str] = None
    category_color: Optional[str] = None


class PredictionResponse(BaseModel):
    station_id: str
    station_name: Optional[str] = None
    prediction_date: str
    predicted_aqi: float
    aqi_category: str
    category_color: str
    health_implications: str
    latest_observed_aqi: float
    historical_window_start: str
    historical_window_end: str
    input_days: int = 7
    model_version: str
    model_name: str
    historical_sequence: List[DailyObservation]
    warnings: List[str] = []
    status: str = "success"


class AvailablePredictionDatesResponse(BaseModel):
    station_id: str
    available_dates: List[str]
    count: int
    note: str

