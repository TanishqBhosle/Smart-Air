"""Analytics and visualization endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, Query
from backend.app.schemas.analytics import (
    AQIDataPoint,
    PollutantDataPoint,
    CategoryDistributionItem,
    StationComparisonItem
)
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/analytics/aqi-trend", response_model=List[AQIDataPoint])
def get_aqi_trend(
    station_id: str = Query(..., description="Station Identifier"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(180, description="Max points to return")
):
    analytics = AnalyticsService.get_instance()
    trend = analytics.get_aqi_trend(station_id, start_date=start_date, end_date=end_date, limit=limit)
    return [AQIDataPoint(**p) for p in trend]


@router.get("/analytics/pollutants", response_model=List[PollutantDataPoint])
def get_pollutants(
    station_id: str = Query(..., description="Station Identifier"),
    limit: int = Query(90, description="Max points to return")
):
    analytics = AnalyticsService.get_instance()
    trend = analytics.get_pollutants_trend(station_id, limit=limit)
    return [PollutantDataPoint(**p) for p in trend]


@router.get("/analytics/categories", response_model=List[CategoryDistributionItem])
def get_categories(
    station_id: Optional[str] = Query(None, description="Optional station filter")
):
    analytics = AnalyticsService.get_instance()
    dist = analytics.get_category_distribution(station_id=station_id)
    return [CategoryDistributionItem(**c) for c in dist]


@router.get("/analytics/station-comparisons", response_model=List[StationComparisonItem])
def get_station_comparisons(
    limit: int = Query(10, description="Number of stations to rank")
):
    analytics = AnalyticsService.get_instance()
    comps = analytics.get_station_comparisons(limit=limit)
    return [StationComparisonItem(**c) for c in comps]

