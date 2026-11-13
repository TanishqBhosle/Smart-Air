"""Common and shared Pydantic models.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: Optional[str] = None
    model_name: Optional[str] = None
    dataset_available: bool
    dataset_records: int
    stations_available: int
    environment: str = "production"

