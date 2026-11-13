"""Station schemas.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class StationItem(BaseModel):
    station_id: str
    station_name: str
    city: str
    state: str
    status: Optional[str] = "Active"
    total_records: int
    first_date: str
    last_date: str
    average_aqi: Optional[float]
    latest_aqi: Optional[float]
    latest_category: Optional[str]
    latest_category_color: Optional[str]


class StationDetailResponse(StationItem):
    available_pollutants: List[str]
    missing_aqi_days: int
    valid_prediction_dates_count: int

