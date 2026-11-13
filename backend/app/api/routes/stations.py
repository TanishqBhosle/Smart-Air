"""Station listing and detail endpoints.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Path
from backend.app.schemas.stations import StationItem, StationDetailResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/stations", response_model=List[StationItem])
def list_stations():
    analytics = AnalyticsService.get_instance()
    stations = analytics.get_all_stations()
    return [StationItem(**s) for s in stations]


@router.get("/stations/{station_id}", response_model=StationDetailResponse)
def get_station(station_id: str = Path(..., description="Unique Station Identifier")):
    analytics = AnalyticsService.get_instance()
    detail = analytics.get_station_detail(station_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Monitoring station '{station_id}' not found.")
    return StationDetailResponse(**detail)

