"""Dashboard schemas.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    station_id: Optional[str]
    station_name: Optional[str]
    latest_aqi: Optional[float]
    previous_aqi: Optional[float]
    aqi_change: Optional[float]
    latest_date: Optional[str]
    aqi_category: Optional[str]
    category_color: Optional[str]
    dominant_pollutant: Optional[str]
    dominant_pollutant_value: Optional[float]
    available_stations_count: int
    total_records_count: int
    dataset_date_range: Dict[str, str]
    predicted_next_day_aqi: Optional[float] = None
    predicted_aqi_category: Optional[str] = None
    predicted_category_color: Optional[str] = None

