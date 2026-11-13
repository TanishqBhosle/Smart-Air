"""Health check endpoint.
"""

from fastapi import APIRouter
from backend.app.schemas.common import HealthResponse
from model.inference.predictor import AQIPredictor
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health():
    predictor = AQIPredictor.get_instance()
    analytics = AnalyticsService.get_instance()

    records_count = len(analytics.data) if analytics.data is not None else 0
    stations_count = analytics.data["StationId"].nunique() if analytics.data is not None else 0

    return HealthResponse(
        status="healthy",
        model_loaded=predictor.is_loaded,
        model_version=predictor.metadata.get("model_version") if predictor.metadata else None,
        model_name=predictor.metadata.get("model_name") if predictor.metadata else None,
        dataset_available=records_count > 0,
        dataset_records=records_count,
        stations_available=stations_count,
        environment="production"
    )

