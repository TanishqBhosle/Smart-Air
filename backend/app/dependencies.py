"""Dependency injection for services.
"""

from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.prediction_service import PredictionService
from model.inference.predictor import AQIPredictor


def get_analytics_service() -> AnalyticsService:
    return AnalyticsService.get_instance()


def get_prediction_service() -> PredictionService:
    return PredictionService.get_instance()


def get_aqi_predictor() -> AQIPredictor:
    return AQIPredictor.get_instance()

