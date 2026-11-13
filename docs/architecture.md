# SmartAir System Architecture

SmartAir is an enterprise-grade environmental intelligence SaaS platform for next-day Air Quality Index (AQI) forecasting.

```mermaid
flowchart TD
    subgraph Client ["Frontend (React + Vite + Tailwind + Recharts)"]
        Landing["Landing Page (/)"]
        Dashboard["Dashboard (/dashboard)"]
        Predictions["Forecast Studio (/predictions)"]
        Stations["Monitoring Network (/stations)"]
        Insights["Model Insights (/model-insights)"]
        ApiClient["Centralized API Client (api.ts)"]
    end

    subgraph Server ["FastAPI Backend Engine (Port 8000)"]
        Router["API Router (/api)"]
        HealthRoute["Health Check (/health)"]
        DashRoute["Dashboard Routes (/dashboard/summary)"]
        StationRoute["Station Routes (/stations)"]
        PredictRoute["Prediction Route (/predictions/next-day)"]
        AnalyticsRoute["Analytics Routes (/analytics/*)"]
        ModelRoute["Model Intel Routes (/model/*)"]
        
        AnalyticsSvc["Analytics Service (In-memory cached CPCB data)"]
        PredictSvc["Prediction Service"]
    end

    subgraph ML ["Machine Learning Inference Engine"]
        Predictor["AQIPredictor (model/inference/predictor.py)"]
        FeatBuilder["FeatureBuilder (model/inference/feature_builder.py)"]
        
        subgraph Artifacts ["Trained Artifacts (model/artifacts/)"]
            KerasModel["model.keras (MLP 128->64)"]
            Imputer["imputer.joblib (Median)"]
            FeatScaler["feature_scaler.joblib (StandardScaler)"]
            TargetScaler["target_scaler.joblib (StandardScaler)"]
            StationEnc["station_encoder.joblib (75 Station OHE)"]
            Metadata["metadata.json"]
        end
    end

    Landing --> ApiClient
    Dashboard --> ApiClient
    Predictions --> ApiClient
    Stations --> ApiClient
    Insights --> ApiClient

    ApiClient --> Router
    Router --> HealthRoute
    Router --> DashRoute
    Router --> StationRoute
    Router --> PredictRoute
    Router --> AnalyticsRoute
    Router --> ModelRoute

    DashRoute --> AnalyticsSvc
    StationRoute --> AnalyticsSvc
    AnalyticsRoute --> AnalyticsSvc
    PredictRoute --> PredictSvc

    PredictSvc --> AnalyticsSvc
    PredictSvc --> Predictor

    Predictor --> FeatBuilder
    FeatBuilder --> Imputer
    FeatBuilder --> FeatScaler
    FeatBuilder --> StationEnc
    Predictor --> KerasModel
    Predictor --> TargetScaler
```

## Architectural Highlights

1. **Separation of Concerns:**
   - `frontend/`: Single Page Application (SPA) designed with professional environmental intelligence design system.
   - `backend/`: High-performance asynchronous FastAPI REST service with Pydantic validation.
   - `model/`: Complete reproducible ML training, evaluation, and inference pipelines.
   - `data/`: Self-contained raw and processed CPCB air quality dataset.

2. **Data Leakage Mitigation:**
   - 7-day lookback sequence generation strictly partitioned by target date.
   - Training dates: Through 2018-11-06 (70% calendar dates).
   - Validation dates: 2018-11-06 to 2019-09-03 (15% calendar dates).
   - Test dates: 2019-09-03 to 2020-07-01 (15% calendar dates).
   - Preprocessing transformers (imputer, feature scaler, target scaler) fitted strictly on training data.
   - `AQI_Bucket` deliberately omitted to prevent circular leakage.

3. **Inference Pipeline:**
   - Receives station identifier and target prediction date.
   - Validates existence and strict continuity of 7 preceding consecutive days.
   - Reconstructs cyclical date features (sine/cosine of day of year and month).
   - Imputes and scales features using the saved training artifacts.
   - Outputs continuous AQI prediction, classified into Indian National AQI bands.

