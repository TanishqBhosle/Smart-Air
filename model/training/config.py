"""Configuration parameters for SmartAir model training and preprocessing.
Matches the methodology of SmartAir_Corrected (2).ipynb.
"""

from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "station_day.csv"
STATIONS_INFO_PATH = BASE_DIR / "data" / "raw" / "stations.csv"
PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"
ARTIFACTS_DIR = BASE_DIR / "model" / "artifacts"

# Dataset constants
DATASET_HANDLE = "rohanrao/air-quality-data-in-india"
TARGET_COLUMN = "AQI"
LOOKBACK_DAYS = 7
MAX_MISSING_FRACTION = 0.60  # Training missingness threshold

ALL_POLLUTANTS = [
    "PM2.5", "PM10", "NO", "NO2", "NOx", "NH3",
    "CO", "SO2", "O3", "Benzene", "Toluene", "Xylene"
]

CALENDAR_FEATURES = ["Day_Sin", "Day_Cos", "Month_Sin", "Month_Cos"]

# Chronological split proportions
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Training hyperparameters (Best model from notebook: LearningRate_0001)
BEST_MODEL_CONFIG = {
    "name": "LearningRate_0001",
    "units": (128, 64),
    "activation": "relu",
    "dropout": 0.2,
    "learning_rate": 0.0001,
    "optimizer": "adam",
    "batch_norm": False,
    "batch_size": 32,
    "max_epochs": 100,
    "patience": 12,
    "reduce_lr_patience": 5,
    "reduce_lr_factor": 0.5,
    "min_lr": 1e-5,
}

SEED = 42

# AQI Categories (National Air Quality Index of India standard)
AQI_CATEGORIES = [
    {"min": 0, "max": 50, "category": "Good", "color": "#10B981", "description": "Minimal health impact"},
    {"min": 51, "max": 100, "category": "Satisfactory", "color": "#34D399", "description": "Minor breathing discomfort to sensitive people"},
    {"min": 101, "max": 200, "category": "Moderate", "color": "#FBBF24", "description": "Breathing discomfort to people with lungs, asthma and heart diseases"},
    {"min": 201, "max": 300, "category": "Poor", "color": "#F97316", "description": "Breathing discomfort to most people on prolonged exposure"},
    {"min": 301, "max": 400, "category": "Very Poor", "color": "#EF4444", "description": "Respiratory illness on prolonged exposure"},
    {"min": 401, "max": 2500, "category": "Severe", "color": "#7F1D1D", "description": "Affects healthy people and seriously impacts those with existing diseases"},
]

