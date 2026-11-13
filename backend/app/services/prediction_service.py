"""Prediction service coordinating data retrieval, sequence assembly, and model inference.
"""

from typing import Dict, Any, List, Optional
from model.inference.predictor import AQIPredictor
from backend.app.services.analytics_service import AnalyticsService


class PredictionService:
    _instance = None

    def __init__(self):
        self.predictor = AQIPredictor.get_instance()
        self.analytics = AnalyticsService.get_instance()

    @classmethod
    def get_instance(cls) -> "PredictionService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def predict_for_station_date(
        self,
        station_id: str,
        prediction_date: str
    ) -> Dict[str, Any]:
        """Validate historical sequence and generate model prediction for station & date."""
        if not self.predictor.is_loaded:
            # Try reloading in case training completed recently
            self.predictor.load_artifacts()
            if not self.predictor.is_loaded:
                raise RuntimeError("Forecasting model is currently not loaded. Check model artifacts.")

        # Check if station exists
        st_meta = self.analytics.get_station_name(station_id)

        # Retrieve preceding 7 days
        records = self.analytics.get_preceding_7_days(station_id, prediction_date)

        # Generate model prediction
        res = self.predictor.predict_next_day(
            station_id=station_id,
            records=records,
            prediction_date=prediction_date
        )

        res["station_name"] = st_meta["name"]
        res["historical_sequence"] = records
        return res

