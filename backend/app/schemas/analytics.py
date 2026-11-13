"""Analytics and chart schemas.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AQIDataPoint(BaseModel):
    date: str
    aqi: float
    category: str
    category_color: str


class PollutantDataPoint(BaseModel):
    date: str
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    no: Optional[float] = None
    co: Optional[float] = None
    so2: Optional[float] = None
    o3: Optional[float] = None
    nh3: Optional[float] = None
    benzene: Optional[float] = None
    toluene: Optional[float] = None
    xylene: Optional[float] = None


class CategoryDistributionItem(BaseModel):
    category: str
    count: int
    percentage: float
    color: str


class StationComparisonItem(BaseModel):
    station_id: str
    station_name: str
    city: str
    average_aqi: float
    max_aqi: float
    latest_aqi: float
    record_count: int

