"""Backend configuration settings using Pydantic Settings.
"""

from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartAir Environmental Intelligence API"
    API_V1_STR: str = "/api"
    VERSION: str = "1.0.0"
    
    # Paths
    BASE_DIR: Path = PROJECT_ROOT
    DATA_PATH: Path = PROJECT_ROOT / "data" / "raw" / "station_day.csv"
    STATIONS_PATH: Path = PROJECT_ROOT / "data" / "raw" / "stations.csv"
    ARTIFACTS_DIR: Path = PROJECT_ROOT / "model" / "artifacts"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"
    ]

    class Config:
        case_sensitive = True


settings = Settings()

