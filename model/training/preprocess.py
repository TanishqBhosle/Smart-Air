"""Data loading, cleaning, feature engineering, and sequence generation.
Reproduces the exact data pipeline from SmartAir_Corrected (2).ipynb without data leakage.
"""

import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple, List, Any

from model.training.config import (
    ALL_POLLUTANTS,
    CALENDAR_FEATURES,
    LOOKBACK_DAYS,
    MAX_MISSING_FRACTION,
    TRAIN_RATIO,
    VAL_RATIO,
    TARGET_COLUMN
)


def load_raw_dataset(csv_path: str) -> pd.DataFrame:
    """Load and perform preliminary validation on raw dataset."""
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()
    
    required = ["StationId", "Date", TARGET_COLUMN]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise KeyError(f"Dataset missing required columns: {missing}")
        
    return df


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the raw dataset following notebook Section 3:
    - Parse Date and AQI
    - Parse available pollutants as numeric
    - Drop missing StationId, Date, AQI
    - Drop AQI < 0
    - Drop duplicates on (StationId, Date) keeping first
    - Sort chronologically per station
    """
    data = df.copy()
    data.columns = data.columns.str.strip()

    data["Date"] = pd.to_datetime(data["Date"], errors="coerce")
    data["AQI"] = pd.to_numeric(data["AQI"], errors="coerce")

    available_pollutants = [c for c in ALL_POLLUTANTS if c in data.columns]
    for col in available_pollutants:
        data[col] = pd.to_numeric(data[col], errors="coerce")

    data = data.dropna(subset=["StationId", "Date", "AQI"]).copy()
    data = data[data["AQI"] >= 0].copy()
    data = data.sort_values(["StationId", "Date"])
    data = data.drop_duplicates(["StationId", "Date"], keep="first")
    data = data.sort_values(["StationId", "Date"]).reset_index(drop=True)
    return data


def compute_calendar_features(data: pd.DataFrame) -> pd.DataFrame:
    """Add cyclical DayOfYear and Month sine/cosine features."""
    df = data.copy()
    day_of_year = df["Date"].dt.dayofyear
    month = df["Date"].dt.month
    
    df["DayOfYear"] = day_of_year
    df["Day_Sin"] = np.sin(2 * np.pi * day_of_year / 365.25).astype(np.float32)
    df["Day_Cos"] = np.cos(2 * np.pi * day_of_year / 365.25).astype(np.float32)
    df["Month_Sin"] = np.sin(2 * np.pi * month / 12.0).astype(np.float32)
    df["Month_Cos"] = np.cos(2 * np.pi * month / 12.0).astype(np.float32)
    return df


def compute_date_splits(data: pd.DataFrame) -> Tuple[pd.Timestamp, pd.Timestamp, pd.Timestamp]:
    """Compute chronological boundary dates based on unique calendar dates."""
    unique_dates = np.array(sorted(data["Date"].dropna().unique()))
    n_dates = len(unique_dates)
    if n_dates < 20:
        raise ValueError("Not enough unique dates for chronological splits.")

    train_cut = max(1, int(n_dates * TRAIN_RATIO))
    val_cut = max(train_cut + 1, int(n_dates * (TRAIN_RATIO + VAL_RATIO)))
    val_cut = min(val_cut, n_dates - 1)

    train_end_date = pd.Timestamp(unique_dates[train_cut - 1])
    val_end_date = pd.Timestamp(unique_dates[val_cut - 1])
    test_end_date = pd.Timestamp(unique_dates[-1])

    return train_end_date, val_end_date, test_end_date


def fit_preprocessing_pipeline(
    data: pd.DataFrame,
    train_end_date: pd.Timestamp
) -> Dict[str, Any]:
    """Fit feature imputer, scaler, and station encoder ONLY on training data.
    Strictly prevents future data leakage.
    """
    available_pollutants = [c for c in ALL_POLLUTANTS if c in data.columns]
    candidate_numeric = available_pollutants + ["AQI"] + CALENDAR_FEATURES

    training_rows_mask = data["Date"] <= train_end_date
    training_missing_fraction = data.loc[training_rows_mask, candidate_numeric].isna().mean()

    selected_pollutants = [
        c for c in available_pollutants
        if training_missing_fraction.get(c, 1.0) <= MAX_MISSING_FRACTION
    ]
    excluded_pollutants = [
        c for c in available_pollutants if c not in selected_pollutants
    ]

    numeric_features = selected_pollutants + ["AQI"] + CALENDAR_FEATURES

    imputer = SimpleImputer(strategy="median")
    imputer.fit(data.loc[training_rows_mask, numeric_features])

    numeric_imputed_train = imputer.transform(data.loc[training_rows_mask, numeric_features])

    scaler = StandardScaler()
    scaler.fit(numeric_imputed_train)

    train_stations = sorted(data.loc[training_rows_mask, "StationId"].astype(str).unique())
    station_to_index = {station: i for i, station in enumerate(train_stations)}

    feature_names = numeric_features + [f"Station_{s}" for s in train_stations]

    return {
        "imputer": imputer,
        "scaler": scaler,
        "train_stations": train_stations,
        "station_to_index": station_to_index,
        "selected_pollutants": selected_pollutants,
        "excluded_pollutants": excluded_pollutants,
        "numeric_features": numeric_features,
        "feature_names": feature_names,
    }


def transform_features(
    data: pd.DataFrame,
    preprocessing: Dict[str, Any]
) -> np.ndarray:
    """Apply fitted imputer, scaler, and station one-hot encoding across data."""
    imputer = preprocessing["imputer"]
    scaler = preprocessing["scaler"]
    numeric_features = preprocessing["numeric_features"]
    train_stations = preprocessing["train_stations"]
    station_to_index = preprocessing["station_to_index"]

    numeric_imputed = imputer.transform(data[numeric_features])
    numeric_scaled = scaler.transform(numeric_imputed).astype(np.float32)

    station_codes = data["StationId"].astype(str).map(station_to_index)
    station_matrix = np.zeros((len(data), len(train_stations)), dtype=np.float32)
    known_mask = station_codes.notna().to_numpy()
    station_matrix[np.where(known_mask)[0], station_codes[known_mask].astype(int).to_numpy()] = 1.0

    feature_matrix = np.concatenate([numeric_scaled, station_matrix], axis=1)
    return feature_matrix


def build_consecutive_sequences(
    data: pd.DataFrame,
    feature_matrix: np.ndarray,
    train_end_date: pd.Timestamp,
    val_end_date: pd.Timestamp,
    lookback: int = LOOKBACK_DAYS
) -> Dict[str, Any]:
    """Build consecutive 7-day sequences for each station and assign to splits
    strictly by the target day.
    """
    X_parts = {"train": [], "validation": [], "test": []}
    y_parts = {"train": [], "validation": [], "test": []}
    persistence_parts = {"train": [], "validation": [], "test": []}
    date_parts = {"train": [], "validation": [], "test": []}
    station_parts = {"train": [], "validation": [], "test": []}

    station_values = data["StationId"].astype(str).to_numpy()
    date_values = data["Date"].to_numpy()
    aqi_values = data["AQI"].to_numpy()

    for station in data["StationId"].astype(str).unique():
        idx = np.where(station_values == station)[0]
        idx = idx[np.argsort(date_values[idx])]

        for pos in range(lookback, len(idx)):
            window_idx = idx[pos - lookback:pos]
            target_idx = idx[pos]

            window_dates = pd.to_datetime(date_values[window_idx])
            target_date = pd.Timestamp(date_values[target_idx])

            expected = pd.date_range(window_dates[0], periods=lookback + 1, freq="D")
            actual = list(window_dates) + [target_date]
            if list(pd.to_datetime(actual)) != list(expected):
                continue

            target = aqi_values[target_idx]
            previous_aqi = aqi_values[window_idx[-1]]
            if not np.isfinite(target) or not np.isfinite(previous_aqi):
                continue

            if target_date <= train_end_date:
                split = "train"
            elif target_date <= val_end_date:
                split = "validation"
            else:
                split = "test"

            X_parts[split].append(feature_matrix[window_idx])
            y_parts[split].append(float(target))
            persistence_parts[split].append(float(previous_aqi))
            date_parts[split].append(target_date)
            station_parts[split].append(station)

    def to_array(values, dtype=np.float32):
        return np.asarray(values, dtype=dtype)

    return {
        "X_train": to_array(X_parts["train"]),
        "X_val": to_array(X_parts["validation"]),
        "X_test": to_array(X_parts["test"]),
        "y_train": to_array(y_parts["train"]),
        "y_val": to_array(y_parts["validation"]),
        "y_test": to_array(y_parts["test"]),
        "persistence_train": to_array(persistence_parts["train"]),
        "persistence_val": to_array(persistence_parts["validation"]),
        "persistence_test": to_array(persistence_parts["test"]),
        "dates_train": pd.to_datetime(date_parts["train"]),
        "dates_val": pd.to_datetime(date_parts["validation"]),
        "dates_test": pd.to_datetime(date_parts["test"]),
        "stations_train": station_parts["train"],
        "stations_val": station_parts["validation"],
        "stations_test": station_parts["test"],
    }

