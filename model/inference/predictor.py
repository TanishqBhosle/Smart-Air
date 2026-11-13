"""Inference engine for SmartAir.
Loads trained artifacts and generates next-day AQI predictions with safety checks.
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
import json
import joblib
import numpy as np

# Set Keras backend
os.environ["KERAS_BACKEND"] = "torch"
import keras

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from model.training.config import (
    ARTIFACTS_DIR,
    AQI_CATEGORIES,
    LOOKBACK_DAYS
)
from model.inference.feature_builder import FeatureBuilder


class AQIPredictor:
    _instance = None

    def __init__(self, artifacts_dir: Path = ARTIFACTS_DIR):
        self.artifacts_dir = artifacts_dir
        self.model = None
        self.imputer = None
        self.feature_scaler = None
        self.target_scaler = None
        self.station_encoder = None
        self.metadata = None
        self.feature_builder = None
        self.is_loaded = False
        self.load_artifacts()

    @classmethod
    def get_instance(cls, artifacts_dir: Path = ARTIFACTS_DIR) -> "AQIPredictor":
        if cls._instance is None:
            cls._instance = cls(artifacts_dir)
        return cls._instance

    def load_artifacts(self):
        """Load all model and preprocessing artifacts from disk."""
        model_path = self.artifacts_dir / "model.keras"
        imputer_path = self.artifacts_dir / "imputer.joblib"
        feat_scaler_path = self.artifacts_dir / "feature_scaler.joblib"
        target_scaler_path = self.artifacts_dir / "target_scaler.joblib"
        station_encoder_path = self.artifacts_dir / "station_encoder.joblib"
        metadata_path = self.artifacts_dir / "metadata.json"

        if not all([
            model_path.exists(),
            imputer_path.exists(),
            feat_scaler_path.exists(),
            target_scaler_path.exists(),
            station_encoder_path.exists(),
            metadata_path.exists()
        ]):
            self.is_loaded = False
            return

        self.model = keras.models.load_model(str(model_path))
        self.imputer = joblib.load(imputer_path)
        self.feature_scaler = joblib.load(feat_scaler_path)
        self.target_scaler = joblib.load(target_scaler_path)
        self.station_encoder = joblib.load(station_encoder_path)

        with open(metadata_path, "r") as f:
            self.metadata = json.load(f)

        numeric_features = self.metadata["features"]["numeric_features"]
        train_stations = self.station_encoder["train_stations"]

        self.feature_builder = FeatureBuilder(
            imputer=self.imputer,
            feature_scaler=self.feature_scaler,
            station_encoder=self.station_encoder,
            numeric_features=numeric_features,
            train_stations=train_stations
        )
        self.is_loaded = True

    @staticmethod
    def get_aqi_category(aqi: float) -> Dict[str, Any]:
        """Categorize AQI value into Indian National AQI bands."""
        for band in AQI_CATEGORIES:
            if band["min"] <= aqi <= band["max"]:
                return band
        if aqi < 0:
            return {"min": 0, "max": 0, "category": "Invalid", "color": "#6B7280", "description": "Negative AQI reading"}
        return {"min": 401, "max": 2500, "category": "Severe+", "color": "#581C87", "description": "Hazardous extreme pollution event"}

    def predict_next_day(
        self,
        station_id: str,
        records: List[Dict[str, Any]],
        prediction_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate next-day AQI prediction using 7 consecutive daily observations."""
        if not self.is_loaded:
            raise RuntimeError("Model artifacts are not loaded. Ensure training pipeline has completed.")

        # Prepare and validate input features
        input_tensor, diagnostics = self.feature_builder.validate_and_prepare_window(
            station_id=station_id,
            records=records,
            expected_target_date=prediction_date
        )

        # Predict scaled output
        pred_scaled = self.model.predict(input_tensor, verbose=0)

        # Invert target scaling
        predicted_aqi = float(self.target_scaler.inverse_transform(pred_scaled).ravel()[0])
        predicted_aqi = round(predicted_aqi, 2)

        # AQI category mapping
        cat_info = self.get_aqi_category(predicted_aqi)

        warnings = []
        if not diagnostics["station_known_in_training"]:
            warnings.append(
                f"Station '{station_id}' was not in the training set (zero station one-hot encoding used)."
            )
        if predicted_aqi < 0:
            warnings.append("Predicted AQI is below 0; indicates extreme low-pollution edge case.")
        elif predicted_aqi > 500:
            warnings.append("Predicted AQI exceeds 500 (hazardous / severe emergency condition).")

        return {
            "station_id": station_id,
            "prediction_date": prediction_date,
            "predicted_aqi": predicted_aqi,
            "aqi_category": cat_info["category"],
            "category_color": cat_info["color"],
            "health_implications": cat_info["description"],
            "latest_observed_aqi": diagnostics["latest_observed_aqi"],
            "historical_window_start": diagnostics["window_start"],
            "historical_window_end": diagnostics["window_end"],
            "input_days": LOOKBACK_DAYS,
            "model_version": self.metadata.get("model_version", "1.0.0"),
            "model_name": self.metadata.get("model_name", "SmartAir ANN"),
            "warnings": warnings,
            "status": "success"
        }

