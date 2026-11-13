"""SmartAir FastAPI Backend Application Entrypoint.
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.core.config import settings
from backend.app.api.router import api_router
from backend.app.services.analytics_service import AnalyticsService
from model.inference.predictor import AQIPredictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize data services on startup
    print("Initializing SmartAir analytics and prediction services...")
    analytics = AnalyticsService.get_instance()
    predictor = AQIPredictor.get_instance()
    print(f"Dataset records loaded: {len(analytics.data) if analytics.data is not None else 0}")
    print(f"Model loaded: {predictor.is_loaded}")
    yield
    print("Shutting down SmartAir API...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production REST API for SmartAir AI-powered AQI forecasting platform.",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "Understand the air. Predict tomorrow.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

