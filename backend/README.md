# SmartAir Backend Engine

High-performance REST API built with FastAPI, Pydantic, Pandas, and Keras 3.

## Endpoints
- `GET /api/health` — System status and model readiness
- `GET /api/dashboard/summary` — Overview metrics
- `GET /api/stations` — Station directory
- `GET /api/stations/{id}` — Station details
- `GET /api/analytics/aqi-trend` — AQI time-series
- `GET /api/analytics/pollutants` — Multi-pollutant time-series
- `GET /api/analytics/categories` — Severity distribution
- `GET /api/predictions/dates/{station_id}` — Available 7-day sequences
- `POST /api/predictions/next-day` — Real ANN prediction

## Running Backend Locally

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

## Running Tests

```bash
pytest backend/tests/test_api.py -v
```

