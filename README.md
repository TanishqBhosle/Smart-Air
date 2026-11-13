# SmartAir — Premium AI-Powered Air Quality Forecasting SaaS Platform

> **Understand the air. Predict tomorrow.**

SmartAir is an environmental intelligence SaaS platform that predicts next-day Air Quality Index (AQI) using historical pollution measurements from India's Central Pollution Control Board (CPCB) monitoring network.

Built upon the technical methodology of `SmartAir_Corrected (2).ipynb`, SmartAir features a strict data-leakage-free machine learning training pipeline, a modular FastAPI backend, and a modern environmental intelligence frontend in React, TypeScript, Vite, Tailwind CSS, and Recharts.

---

## 🚀 Key Features

- **7-Day Consecutive Historical Lookback:** Strict chronological sequence construction without future data leakage.
- **Feedforward Artificial Neural Network (ANN/MLP):** Fully trained Keras 3 neural network ($128 \to 64$ hidden units, ReLU, Dropout $0.2$, Adam $\text{lr}=0.0001$).
- **Multi-Pollutant Tracking:** Ingestion and visualization for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{NO}$, $\text{CO}$, $\text{SO}_2$, $\text{O}_3$, $\text{NH}_3$, $\text{Benzene}$, and $\text{Toluene}$.
- **Empirical Validation:** **15.47% RMSE improvement** over the naive persistence baseline on 26,137 held-out test observations.
- **National AQI Categorization:** Continuous regression output categorized into India's National Air Quality Index bands (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) with actionable health advisories.
- **Interactive Forecast Studio:** Select any monitoring station and valid historical window to review the preceding 7-day input tensor and generate predictions in real-time.

---

## 📊 Empirical Model Performance

Evaluated strictly on held-out test data (dates from September 3, 2019 to July 1, 2020):

| Model | MAE | MSE | RMSE | $R^2$ Score |
| :--- | :--- | :--- | :--- | :--- |
| **Naive Persistence Baseline** | 28.56 | 2251.98 | 47.45 | 0.8356 |
| **SmartAir ANN Model** | **27.44** | **1609.12** | **40.11** | **0.8826** |

**Empirical Result:** The SmartAir ANN achieves a **15.47% RMSE reduction** and an **$R^2$ of 0.8826**.

---

## 📁 Repository Structure

```text
SmartAir/
├── frontend/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/           # AQITrendChart, PollutantChart, CategoryPieChart
│   │   │   ├── common/           # Badge, LoadingSpinner, EmptyState
│   │   │   ├── dashboard/        # KPICard
│   │   │   └── layout/           # Navbar, Sidebar
│   │   ├── pages/                # LandingPage, DashboardPage, PredictionsPage, StationsPage, ModelInsightsPage
│   │   ├── services/             # api.ts (Centralized API client)
│   │   ├── types/                # index.ts (Full TypeScript interfaces)
│   │   ├── utils/                # colors.ts (AQI categories, formatting)
│   │   ├── App.tsx               # Client routes
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── backend/                      # FastAPI Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/           # health, dashboard, predictions, stations, analytics, model_routes
│   │   │   └── router.py         # Consolidated API router
│   │   ├── core/                 # config.py (Pydantic Settings)
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── services/             # analytics_service.py, prediction_service.py
│   │   ├── main.py               # FastAPI application entrypoint
│   │   └── dependencies.py
│   ├── tests/                    # test_api.py (Comprehensive automated test suite)
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── model/                        # Machine Learning Pipeline
│   ├── training/
│   │   ├── config.py             # Hyperparameters, pollutants, paths
│   │   ├── preprocess.py         # Chronological splits, scaling, 7-day sequences
│   │   ├── train.py              # Complete training pipeline execution
│   │   └── evaluate.py           # Metrics, baselines, error breakdown
│   ├── inference/
│   │   ├── feature_builder.py    # Input validation & tensor transformation
│   │   └── predictor.py          # Artifact loading & prediction service
│   ├── artifacts/                # Exported model & preprocessing objects
│   │   ├── model.keras           # Trained neural network
│   │   ├── imputer.joblib        # Fitted Median SimpleImputer
│   │   ├── feature_scaler.joblib # Fitted StandardScaler for features
│   │   ├── target_scaler.joblib  # Fitted StandardScaler for AQI target
│   │   ├── station_encoder.joblib# One-hot station categorical encoder
│   │   ├── metadata.json         # Architecture, history, and training metadata
│   │   └── validation_experiments.json
│   ├── requirements.txt
│   └── README.md
│
├── data/
│   ├── raw/                      # station_day.csv, stations.csv (CPCB dataset)
│   └── processed/
│
├── docs/                         # Documentation
│   ├── architecture.md           # Architecture diagram and system flow
│   ├── api-documentation.md      # Full REST endpoint specifications
│   └── model-documentation.md    # Machine learning technical report
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🛠️ Local Development & Execution

### Prerequisites
- Node.js (v18+) & npm
- Python (3.11 or 3.12)

---

### 1. Model Training (Optional — Artifacts Already Built & Saved)

The model is pre-trained and its binaries are saved under `model/artifacts/`. To retrain:

```bash
# From repository root
pip install -r model/requirements.txt
python -m model.training.train
```

---

### 2. Backend Service

```bash
# From repository root
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000/api`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

---

### 3. Frontend Application

```bash
cd frontend
npm install
npm run dev
```

- Open `http://localhost:5173` in your browser.

---

### 4. Running Automated Tests

Run the test suite across all API endpoints, data loaders, and model predictions:

```bash
pytest backend/tests/test_api.py -v
```

**Test Results:**
```text
backend/tests/test_api.py::test_root_endpoint PASSED                     [  7%]
backend/tests/test_api.py::test_health_endpoint PASSED                   [ 15%]
backend/tests/test_api.py::test_dashboard_summary PASSED                 [ 23%]
backend/tests/test_api.py::test_list_stations PASSED                     [ 30%]
backend/tests/test_api.py::test_station_detail_valid PASSED              [ 38%]
backend/tests/test_api.py::test_station_detail_invalid PASSED            [ 46%]
backend/tests/test_api.py::test_aqi_trend PASSED                         [ 53%]
backend/tests/test_api.py::test_pollutants_trend PASSED                  [ 61%]
backend/tests/test_api.py::test_category_distribution PASSED             [ 69%]
backend/tests/test_api.py::test_station_comparisons PASSED               [ 76%]
backend/tests/test_api.py::test_prediction_dates_query PASSED            [ 84%]
backend/tests/test_api.py::test_prediction_endpoint_invalid_date PASSED  [ 92%]
backend/tests/test_api.py::test_prediction_endpoint_real_model PASSED    [100%]

======================= 13 passed in 9.85s =======================
```

---

### 5. Running with Docker Compose

```bash
docker-compose up --build
```

---

## 🔒 Rigorous Data Leakage Safeguards

1. **Chronological Splitting:**
   - 70% unique dates for Training (through 2018-11-06).
   - 15% unique dates for Validation (2018-11-06 to 2019-09-03).
   - 15% unique dates for Testing (after 2019-09-03).
2. **Preprocessing Isolation:**
   - Imputers and scalers are strictly fitted on the training split only.
3. **Target Leakage Prevention:**
   - `AQI_Bucket` is deliberately excluded as an input feature because it is derived directly from the target `AQI`.
4. **Sequence Continuity Validation:**
   - Every input sequence is required to contain exactly 7 consecutive days for the same station. Any gap in calendar dates immediately disqualifies the sequence.

---

## ⚠️ Academic Context & Limitations

- SmartAir is an academic environmental intelligence system built with historical CPCB monitoring data (2015–2020).
- It does not claim live sensor feeds or replace government emergency response warning systems.
- Predictions represent continuous regression forecasts based on observed surface pollution chemistry and cyclical calendar features.

