"""Comprehensive automated test suite for SmartAir FastAPI backend and inference pipeline.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def test_root_endpoint():
    """Verify root status and documentation URL."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == settings.PROJECT_NAME
    assert data["docs_url"] == "/docs"


def test_health_endpoint():
    """Verify health check endpoint and dataset availability."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["dataset_available"] is True
    assert data["dataset_records"] > 50000
    assert data["stations_available"] > 50


def test_dashboard_summary():
    """Verify dashboard KPI summary calculations."""
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["available_stations_count"] > 50
    assert data["total_records_count"] > 50000
    assert data["latest_aqi"] is not None
    assert data["aqi_category"] is not None


def test_list_stations():
    """Verify monitoring station list query."""
    response = client.get("/api/stations")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) > 50
    first = stations[0]
    assert "station_id" in first
    assert "station_name" in first
    assert "city" in first
    assert first["total_records"] > 0


def test_station_detail_valid():
    """Verify detailed metadata for a known station (DL001)."""
    response = client.get("/api/stations/DL001")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "DL001"
    assert data["total_records"] > 0
    assert "available_pollutants" in data


def test_station_detail_invalid():
    """Verify 404 error response for non-existent station."""
    response = client.get("/api/stations/INVALID_STATION_XYZ")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_aqi_trend():
    """Verify historical AQI trend series."""
    response = client.get("/api/analytics/aqi-trend?station_id=DL001&limit=30")
    assert response.status_code == 200
    points = response.json()
    assert len(points) > 0
    assert "date" in points[0]
    assert "aqi" in points[0]
    assert "category" in points[0]


def test_pollutants_trend():
    """Verify pollutant concentration trend series."""
    response = client.get("/api/analytics/pollutants?station_id=DL001&limit=30")
    assert response.status_code == 200
    points = response.json()
    assert len(points) > 0
    assert "date" in points[0]
    assert "pm25" in points[0]


def test_category_distribution():
    """Verify AQI category distribution calculation."""
    response = client.get("/api/analytics/categories?station_id=DL001")
    assert response.status_code == 200
    dist = response.json()
    assert len(dist) == 6
    total_pct = sum(item["percentage"] for item in dist)
    assert 99.0 <= total_pct <= 101.0


def test_station_comparisons():
    """Verify top station comparison ranking."""
    response = client.get("/api/analytics/station-comparisons?limit=5")
    assert response.status_code == 200
    comps = response.json()
    assert len(comps) == 5
    assert comps[0]["average_aqi"] >= comps[1]["average_aqi"]


def test_prediction_dates_query():
    """Verify retrieval of valid prediction dates for a station."""
    response = client.get("/api/predictions/dates/DL001")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "DL001"
    assert data["count"] > 0
    assert len(data["available_dates"]) > 0


def test_prediction_endpoint_invalid_date():
    """Verify 400 error when target date lacks 7 consecutive historical days."""
    response = client.post("/api/predictions/next-day", json={
        "station_id": "DL001",
        "prediction_date": "1999-01-01"
    })
    assert response.status_code == 400
    assert "missing" in response.json()["detail"].lower()


def test_prediction_endpoint_real_model():
    """Verify that a valid prediction request returns real ANN forecast."""
    # First get an available date
    dates_resp = client.get("/api/predictions/dates/DL001")
    available_dates = dates_resp.json()["available_dates"]
    assert len(available_dates) > 0
    test_date = available_dates[-1]  # Pick the latest valid date

    response = client.post("/api/predictions/next-day", json={
        "station_id": "DL001",
        "prediction_date": test_date
    })
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "DL001"
    assert data["prediction_date"] == test_date
    assert isinstance(data["predicted_aqi"], (int, float))
    assert data["predicted_aqi"] > 0
    assert data["aqi_category"] in ["Good", "Satisfactory", "Moderate", "Poor", "Very Poor", "Severe", "Severe+"]
    assert data["input_days"] == 7
    assert len(data["historical_sequence"]) == 7
    assert data["status"] == "success"

