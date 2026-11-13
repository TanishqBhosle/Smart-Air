# SmartAir REST API Documentation

Base URL: `http://localhost:8000/api`
Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Health & Status

### `GET /health`
Returns system status, active model version, and dataset availability.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0.0",
  "model_name": "SmartAir ANN (LearningRate_0001)",
  "dataset_available": true,
  "dataset_records": 87025,
  "stations_available": 109,
  "environment": "production"
}
```

---

## 2. Dashboard

### `GET /dashboard/summary?station_id={station_id}`
Returns aggregated KPI statistics for the selected monitoring station.

**Parameters:**
- `station_id` (optional, string): Unique station ID. Defaults to `DL001`.

**Response (200 OK):**
```json
{
  "station_id": "DL001",
  "station_name": "Alipur, Delhi - DPCC",
  "latest_aqi": 129.0,
  "previous_aqi": 115.0,
  "aqi_change": 14.0,
  "latest_date": "2020-07-01",
  "aqi_category": "Moderate",
  "category_color": "#FBBF24",
  "dominant_pollutant": "PM10",
  "dominant_pollutant_value": 114.2,
  "available_stations_count": 109,
  "total_records_count": 87025,
  "dataset_date_range": {
    "start": "2015-01-01",
    "end": "2020-07-01"
  },
  "predicted_next_day_aqi": null,
  "predicted_aqi_category": null,
  "predicted_category_color": null
}
```

---

## 3. Monitoring Stations

### `GET /stations`
Returns list of all available monitoring stations with coverage and average AQI.

### `GET /stations/{station_id}`
Returns detailed metadata for a single station, including available pollutant sensors and valid forecast date counts.

---

## 4. Historical Analytics

### `GET /analytics/aqi-trend?station_id={station_id}&limit={limit}`
Returns time-series AQI points formatted for line and area charting.

### `GET /analytics/pollutants?station_id={station_id}&limit={limit}`
Returns historical concentration values for PM2.5, PM10, NO2, SO2, CO, O3.

### `GET /analytics/categories?station_id={station_id}`
Returns distribution of days across National AQI categories.

### `GET /analytics/station-comparisons?limit={limit}`
Returns ranked stations by average historical AQI.

---

## 5. Machine Learning Prediction

### `POST /predictions/next-day`
Generates real next-day AQI prediction using the trained ANN model.

**Request Body:**
```json
{
  "station_id": "DL001",
  "prediction_date": "2020-07-01"
}
```

**Response (200 OK):**
```json
{
  "station_id": "DL001",
  "station_name": "Alipur, Delhi - DPCC",
  "prediction_date": "2020-07-01",
  "predicted_aqi": 116.87,
  "aqi_category": "Moderate",
  "category_color": "#FBBF24",
  "health_implications": "Breathing discomfort to people with lungs, asthma and heart diseases",
  "latest_observed_aqi": 129.0,
  "historical_window_start": "2020-06-24",
  "historical_window_end": "2020-06-30",
  "input_days": 7,
  "model_version": "1.0.0",
  "model_name": "SmartAir ANN (LearningRate_0001)",
  "historical_sequence": [
    {
      "date": "2020-06-24",
      "aqi": 115.0,
      "aqi_category": "Moderate",
      "category_color": "#FBBF24",
      "pm25": 42.1,
      "pm10": 98.4,
      "no2": 21.0
    }
  ],
  "warnings": [],
  "status": "success"
}
```

### `GET /predictions/dates/{station_id}`
Returns all calendar dates for a station where the preceding 7 consecutive days exist in the dataset.

---

## 6. Model Intelligence

### `GET /model/info`
Returns full training metadata, input feature specifications, layer architecture, and date splits.

### `GET /model/metrics`
Returns validation and held-out test evaluation metrics.

### `GET /model/experiments`
Returns controlled hyperparameter experiment comparisons.

