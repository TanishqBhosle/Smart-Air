import axios, { AxiosError } from 'axios';
import {
  DashboardSummary,
  Station,
  StationDetail,
  AQIPoint,
  PollutantPoint,
  CategoryDistribution,
  StationComparison,
  PredictionResult,
  PredictionDatesResponse,
  ModelInfo,
  Experiment,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-fallback to port 8001 if port 8000 is occupied or unreachable
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      !config._retried8001 &&
      config.baseURL &&
      config.baseURL.includes(':8000') &&
      (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED')
    ) {
      config._retried8001 = true;
      config.baseURL = config.baseURL.replace(':8000', ':8001');
      return apiClient(config);
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  status?: number;
  detail?: string;

  constructor(message: string, status?: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

const handleApiError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string }>;
    const detail = err.response?.data?.detail;
    const message = detail || err.message || fallbackMessage;
    throw new ApiError(message, err.response?.status, detail);
  }
  throw new ApiError(fallbackMessage);
};

export const api = {
  // Health
  async getHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch health status');
    }
  },

  // Dashboard
  async getDashboardSummary(stationId?: string): Promise<DashboardSummary> {
    try {
      const params = stationId ? { station_id: stationId } : {};
      const response = await apiClient.get<DashboardSummary>('/dashboard/summary', { params });
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch dashboard summary');
    }
  },

  // Stations
  async getStations(): Promise<Station[]> {
    try {
      const response = await apiClient.get<Station[]>('/stations');
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch stations list');
    }
  },

  async getStationDetail(stationId: string): Promise<StationDetail> {
    try {
      const response = await apiClient.get<StationDetail>(`/stations/${encodeURIComponent(stationId)}`);
      return response.data;
    } catch (err) {
      return handleApiError(err, `Failed to fetch details for station ${stationId}`);
    }
  },

  // Analytics
  async getAQITrend(stationId: string, limit = 180): Promise<AQIPoint[]> {
    try {
      const response = await apiClient.get<AQIPoint[]>('/analytics/aqi-trend', {
        params: { station_id: stationId, limit },
      });
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch AQI trend');
    }
  },

  async getPollutantsTrend(stationId: string, limit = 90): Promise<PollutantPoint[]> {
    try {
      const response = await apiClient.get<PollutantPoint[]>('/analytics/pollutants', {
        params: { station_id: stationId, limit },
      });
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch pollutant trends');
    }
  },

  async getCategoryDistribution(stationId?: string): Promise<CategoryDistribution[]> {
    try {
      const params = stationId ? { station_id: stationId } : {};
      const response = await apiClient.get<CategoryDistribution[]>('/analytics/categories', { params });
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch AQI category distribution');
    }
  },

  async getStationComparisons(limit = 10): Promise<StationComparison[]> {
    try {
      const response = await apiClient.get<StationComparison[]>('/analytics/station-comparisons', {
        params: { limit },
      });
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch station comparisons');
    }
  },

  // Predictions
  async getAvailablePredictionDates(stationId: string): Promise<PredictionDatesResponse> {
    try {
      const response = await apiClient.get<PredictionDatesResponse>(`/predictions/dates/${encodeURIComponent(stationId)}`);
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch valid prediction dates');
    }
  },

  async predictNextDay(stationId: string, predictionDate: string): Promise<PredictionResult> {
    try {
      const response = await apiClient.post<PredictionResult>('/predictions/next-day', {
        station_id: stationId,
        prediction_date: predictionDate,
      });
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to generate AQI forecast');
    }
  },

  // Model Intelligence
  async getModelInfo(): Promise<ModelInfo> {
    try {
      const response = await apiClient.get<ModelInfo>('/model/info');
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch model info');
    }
  },

  async getModelExperiments(): Promise<Experiment[]> {
    try {
      const response = await apiClient.get<Experiment[]>('/model/experiments');
      return response.data;
    } catch (err) {
      return handleApiError(err, 'Failed to fetch hyperparameter experiment history');
    }
  },
};

