"""Dashboard endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Query
from backend.app.schemas.dashboard import DashboardSummaryResponse
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(station_id: Optional[str] = Query(None, description="Station ID")):
    analytics = AnalyticsService.get_instance()
    summary = analytics.get_dashboard_summary(station_id=station_id)
    return DashboardSummaryResponse(**summary)

