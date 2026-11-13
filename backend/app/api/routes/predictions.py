"""Prediction endpoints.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Query, Path
from backend.app.schemas.predictions import (
    PredictionRequest,
    PredictionResponse,
    AvailablePredictionDatesResponse
)
from backend.app.services.prediction_service import PredictionService
from backend.app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.post("/predictions/next-day", response_model=PredictionResponse)
def predict_next_day(request: PredictionRequest):
    """Generate real ANN forecast using 7 consecutive preceding daily observations."""
    pred_service = PredictionService.get_instance()
    try:
        result = pred_service.predict_for_station_date(
            station_id=request.station_id,
            prediction_date=request.prediction_date
        )
        return PredictionResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/predictions/dates/{station_id}", response_model=AvailablePredictionDatesResponse)
def get_prediction_dates(
    station_id: str = Path(..., description="Monitoring Station ID")
):
    """Retrieve all available dates for which 7 consecutive historical days exist."""
    analytics = AnalyticsService.get_instance()
    dates = analytics.get_valid_prediction_dates(station_id)
    return AvailablePredictionDatesResponse(
        station_id=station_id,
        available_dates=dates,
        count=len(dates),
        note="Each date in this list has the required 7 consecutive historical days available in the dataset."
    )

