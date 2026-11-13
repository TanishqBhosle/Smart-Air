export interface Station {
  station_id: string;
  station_name: string;
  city: string;
  state: string;
  status: string;
  total_records: number;
  first_date: string;
  last_date: string;
  average_aqi: number | null;
  latest_aqi: number | null;
  latest_category: string | null;
  latest_category_color: string | null;
}

export interface StationDetail extends Station {
  available_pollutants: string[];
  missing_aqi_days: number;
  valid_prediction_dates_count: number;
}

export interface DashboardSummary {
  station_id: string | null;
  station_name: string | null;
  latest_aqi: number | null;
  previous_aqi: number | null;
  aqi_change: number | null;
  latest_date: string | null;
  aqi_category: string | null;
  category_color: string | null;
  dominant_pollutant: string | null;
  dominant_pollutant_value: number | null;
  available_stations_count: number;
  total_records_count: number;
  dataset_date_range: {
    start: string;
    end: string;
  };
  predicted_next_day_aqi?: number | null;
  predicted_aqi_category?: string | null;
  predicted_category_color?: string | null;
}

export interface AQIPoint {
  date: string;
  aqi: number;
  category: string;
  category_color: string;
}

export interface PollutantPoint {
  date: string;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  no?: number | null;
  co?: number | null;
  so2?: number | null;
  o3?: number | null;
  nh3?: number | null;
  benzene?: number | null;
  toluene?: number | null;
  xylene?: number | null;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StationComparison {
  station_id: string;
  station_name: string;
  city: string;
  average_aqi: number;
  max_aqi: number;
  latest_aqi: number;
  record_count: number;
}

export interface DailyObservation {
  date: string;
  aqi: number;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
  o3?: number | null;
  aqi_category?: string | null;
  category_color?: string | null;
}

export interface PredictionResult {
  station_id: string;
  station_name?: string;
  prediction_date: string;
  predicted_aqi: number;
  aqi_category: string;
  category_color: string;
  health_implications: string;
  latest_observed_aqi: number;
  historical_window_start: string;
  historical_window_end: string;
  input_days: number;
  model_version: string;
  model_name: string;
  historical_sequence: DailyObservation[];
  warnings: string[];
  status: string;
}

export interface PredictionDatesResponse {
  station_id: string;
  available_dates: string[];
  count: number;
  note: string;
}

export interface ModelInfo {
  model_version: string;
  model_name: string;
  framework: string;
  training_timestamp: string;
  training_duration_seconds: number;
  dataset: {
    name: string;
    raw_records: number;
    cleaned_records: number;
    total_stations: number;
    training_stations: number;
    date_range: {
      start: string;
      end: string;
    };
  };
  target: {
    column: string;
    scaling: string;
    mean: number;
    scale: number;
  };
  features: {
    lookback_days: number;
    selected_pollutants: string[];
    excluded_pollutants: string[];
    numeric_features: string[];
    total_daily_features: number;
    total_flattened_input: number;
    feature_names: string[];
  };
  architecture: {
    type: string;
    layers: Array<{
      type: string;
      units?: number;
      activation?: string;
      rate?: number;
      shape?: any;
      output_shape?: any;
    }>;
    optimizer: string;
    learning_rate: number;
    loss: string;
    batch_size: number;
    epochs_trained: number;
  };
  splits: {
    train_end_date: string;
    val_end_date: string;
    test_end_date: string;
    train_samples: number;
    val_samples: number;
    test_samples: number;
  };
  metrics: {
    validation: {
      MAE: number;
      MSE: number;
      RMSE: number;
      R2: number;
    };
    test_ann: {
      MAE: number;
      MSE: number;
      RMSE: number;
      R2: number;
    };
    test_persistence: {
      MAE: number;
      MSE: number;
      RMSE: number;
      R2: number;
    };
    rmse_improvement_percent: number;
  };
  training_history: {
    loss: number[];
    val_loss: number[];
    mae?: number[];
    val_mae?: number[];
  };
}

export interface Experiment {
  Model: string;
  Architecture: string;
  Activation: string;
  Optimizer: string;
  "Learning Rate": number;
  Dropout: number;
  "Batch Normalization": boolean;
  "Batch Size": number;
  "Epochs Trained": number;
  "Validation MAE": number;
  "Validation MSE": number;
  "Validation RMSE": number;
  "Validation R2": number;
}

