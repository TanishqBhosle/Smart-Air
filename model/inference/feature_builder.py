"""Feature builder for inference.
Validates 7-day sequences and applies the exact preprocessing transformations
fitted during training, preventing data leakage or schema mismatch.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from model.training.config import (
    CALENDAR_FEATURES,
    LOOKBACK_DAYS,
)


class FeatureBuilder:
    def __init__(
        self,
        imputer,
        feature_scaler,
        station_encoder: Dict[str, Any],
        numeric_features: List[str],
        train_stations: List[str]
    ):
        self.imputer = imputer
        self.scaler = feature_scaler
        self.station_encoder = station_encoder
        self.numeric_features = numeric_features
        self.train_stations = train_stations
        self.station_to_index = station_encoder.get("station_to_index", {})

    def validate_and_prepare_window(
        self,
        station_id: str,
        records: List[Dict[str, Any]],
        expected_target_date: str = None
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Validates that records contains exactly 7 consecutive days for station_id.
        Computes calendar features, applies imputer and scaler, and applies station one-hot encoding.
        Returns array of shape (1, 7, num_features).
        """
        if len(records) != LOOKBACK_DAYS:
            raise ValueError(
                f"Prediction requires exactly {LOOKBACK_DAYS} consecutive historical days; received {len(records)}."
            )

        df = pd.DataFrame(records)
        df.columns = df.columns.str.strip()

        # Handle case variations safely without creating duplicate columns
        if "date" in df.columns and "Date" not in df.columns:
            df = df.rename(columns={"date": "Date"})
        elif "date" in df.columns and "Date" in df.columns:
            df = df.drop(columns=["date"])

        if "aqi" in df.columns and "AQI" not in df.columns:
            df = df.rename(columns={"aqi": "AQI"})
        elif "aqi" in df.columns and "AQI" in df.columns:
            df = df.drop(columns=["aqi"])

        # Drop any accidental duplicate column names
        df = df.loc[:, ~df.columns.duplicated()]

        if "Date" not in df.columns:
            raise KeyError("Records must include 'Date' column.")
        if "AQI" not in df.columns:
            raise KeyError("Records must include 'AQI' column.")

        df["Date"] = pd.to_datetime(df["Date"])
        df = df.sort_values("Date").reset_index(drop=True)

        # Check consecutive calendar days
        dates = df["Date"].tolist()
        expected_dates = pd.date_range(dates[0], periods=LOOKBACK_DAYS, freq="D")
        if [d.date() for d in dates] != [d.date() for d in expected_dates]:
            raise ValueError(
                f"Historical observations are not consecutive calendar days. Expected: {[str(d.date()) for d in expected_dates]}, got {[str(d.date()) for d in dates]}."
            )

        # If expected_target_date is given, verify it is immediately following the 7th day
        if expected_target_date:
            target_dt = pd.to_datetime(expected_target_date)
            expected_next = dates[-1] + pd.Timedelta(days=1)
            if target_dt.date() != expected_next.date():
                raise ValueError(
                    f"Target prediction date {expected_target_date} must be exactly the day following the last historical observation {dates[-1].date()}."
                )

        # Add calendar features
        day_of_year = df["Date"].dt.dayofyear
        month = df["Date"].dt.month
        df["DayOfYear"] = day_of_year
        df["Day_Sin"] = np.sin(2 * np.pi * day_of_year / 365.25).astype(np.float32)
        df["Day_Cos"] = np.cos(2 * np.pi * day_of_year / 365.25).astype(np.float32)
        df["Month_Sin"] = np.sin(2 * np.pi * month / 12.0).astype(np.float32)
        df["Month_Cos"] = np.cos(2 * np.pi * month / 12.0).astype(np.float32)

        # Ensure all numeric features exist in df; fill missing columns with NaN
        for feat in self.numeric_features:
            if feat not in df.columns:
                df[feat] = np.nan
            else:
                df[feat] = pd.to_numeric(df[feat], errors="coerce")

        # Impute
        numeric_imputed = self.imputer.transform(df[self.numeric_features])
        # Scale
        numeric_scaled = self.scaler.transform(numeric_imputed).astype(np.float32)

        # One-hot station encode
        station_vector = np.zeros(len(self.train_stations), dtype=np.float32)
        if station_id in self.station_to_index:
            station_vector[self.station_to_index[station_id]] = 1.0

        # Broadcast station vector across 7 days
        station_matrix = np.tile(station_vector, (LOOKBACK_DAYS, 1))

        # Concatenate features
        sample_features = np.concatenate([numeric_scaled, station_matrix], axis=1)
        # Reshape to (1, 7, total_features)
        input_tensor = np.expand_dims(sample_features, axis=0)

        diagnostic_info = {
            "station_id": station_id,
            "station_known_in_training": station_id in self.station_to_index,
            "window_start": str(dates[0].date()),
            "window_end": str(dates[-1].date()),
            "latest_observed_aqi": float(df["AQI"].iloc[-1]),
            "feature_shape": list(input_tensor.shape)
        }

        return input_tensor, diagnostic_info
