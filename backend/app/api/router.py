"""API router aggregator.
"""

from fastapi import APIRouter
from backend.app.api.routes import (
    health,
    dashboard,
    stations,
    analytics,
    predictions,
    model_routes
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(stations.router, tags=["Stations"])
api_router.include_router(analytics.router, tags=["Analytics"])
api_router.include_router(predictions.router, tags=["Predictions"])
api_router.include_router(model_routes.router, tags=["Model Intelligence"])

