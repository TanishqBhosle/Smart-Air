import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../services/api';
import { Station, PredictionResult } from '../types';
import { formatDate, getCategoryStyle } from '../utils/colors';

export const PredictionsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('DL001');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingDates, setLoadingDates] = useState<boolean>(false);

  const [predicting, setPredicting] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load stations
  useEffect(() => {
    let isMounted = true;
    api.getStations()
      .then((stList) => {
        if (!isMounted) return;
        setStations(stList);
        if (stList.length > 0) {
          setSelectedStationId(stList[0].station_id);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load stations');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Whenever station changes, fetch valid prediction dates
  useEffect(() => {
    if (!selectedStationId) return;
    setLoadingDates(true);
    setPrediction(null);
    setError(null);

    api.getAvailablePredictionDates(selectedStationId)
      .then((res) => {
        setAvailableDates(res.available_dates);
        if (res.available_dates.length > 0) {
          // Select the most recent available date by default
          setSelectedDate(res.available_dates[res.available_dates.length - 1]);
        } else {
          setSelectedDate('');
        }
        setLoadingDates(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch valid prediction dates for station');
        setLoadingDates(false);
      });
  }, [selectedStationId]);

  const handleGeneratePrediction = async () => {
    if (!selectedStationId || !selectedDate) return;
    setPredicting(true);
    setError(null);

    try {
      const result = await api.predictNextDay(selectedStationId, selectedDate);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setPredicting(false);
    }
  };

  const currentStation = stations.find((s) => s.station_id === selectedStationId);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                AI Air Quality Forecasting Engine
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Supervised ANN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Select an environmental monitoring station and valid date to generate the next-day AQI forecast
              using the preceding 7 consecutive daily observations.
            </p>
          </div>

          {/* Configuration Form Card */}
          <div className="p-6 rounded-2xl border border-border surface-card space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              <Cpu className="w-4 h-4" />
              <span>Forecast Input Parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station select */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Monitoring Station
                </label>
                <div className="relative">
                  <select
                    value={selectedStationId}
                    onChange={(e) => setSelectedStationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
                  >
                    {stations.map((s) => (
                      <option key={s.station_id} value={s.station_id}>
                        {s.city} — {s.station_name} ({s.station_id})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <Radio className="w-4 h-4" />
                  </div>
                </div>
                {currentStation && (
                  <p className="text-[11px] text-slate-400">
                    {currentStation.city}, {currentStation.state} • {currentStation.total_records} historical records
                  </p>
                )}
              </div>

              {/* Date select */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Target Prediction Date (Day 8)
                </label>
                <div className="relative">
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={loadingDates || availableDates.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none disabled:opacity-50"
                  >
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {d} ({formatDate(d)})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {availableDates.length > 0
                      ? `${availableDates.length} valid 7-day chronological sequences available.`
                      : loadingDates
                      ? 'Validating historical sequence continuity...'
                      : 'No 7-day consecutive sequence available for this station.'}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Forecasting methodology strictly enforces 7 lag days without future leakage.</span>
              </div>

              <button
                onClick={handleGeneratePrediction}
                disabled={predicting || !selectedDate}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:pointer-events-none text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {predicting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Executing ANN Inference...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Forecast</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <span className="font-semibold">Prediction Execution Failed:</span> {error}
              </div>
            </div>
          )}

          {/* Prediction Result Display */}
          {prediction && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-surface to-surface space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                        Inference Output
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {prediction.model_name}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Forecast for {formatDate(prediction.prediction_date)}
                    </h3>
                  </div>

                  <Badge category={prediction.aqi_category} aqi={prediction.predicted_aqi} size="lg" />
                </div>

                {/* Score & Context Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Predicted Score */}
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
                      Predicted Air Quality Index
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold font-mono text-white tracking-tight">
                        {prediction.predicted_aqi}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">AQI</span>
                    </div>
                    <p className="text-xs text-slate-300 pt-1">
                      {prediction.health_implications}
                    </p>
                  </div>

                  {/* Persistence Baseline Delta */}
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
                      Comparison vs Previous Day
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-slate-200">
                        {prediction.latest_observed_aqi}
                      </span>
                      <span className="text-xs text-slate-400">
                        &rarr; {prediction.predicted_aqi}
                      </span>
                    </div>
                    <div className="text-xs font-mono pt-1">
                      {prediction.predicted_aqi > prediction.latest_observed_aqi ? (
                        <span className="text-rose-400">
                          +{Math.round((prediction.predicted_aqi - prediction.latest_observed_aqi) * 10) / 10} AQI (Air Degrading)
                        </span>
                      ) : (
                        <span className="text-emerald-400">
                          {Math.round((prediction.predicted_aqi - prediction.latest_observed_aqi) * 10) / 10} AQI (Air Improving)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Based on Day 7 lag observation: {formatDate(prediction.historical_window_end)}
                    </p>
                  </div>

                  {/* Window Details */}
                  <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
                      Historical Sequence Window
                    </span>
                    <div className="text-sm font-medium text-white space-y-1">
                      <div>Start: <span className="font-mono text-slate-300">{prediction.historical_window_start}</span></div>
                      <div>End: <span className="font-mono text-slate-300">{prediction.historical_window_end}</span></div>
                    </div>
                    <div className="text-xs text-slate-400 pt-1">
                      Exactly 7 consecutive days used by ANN Flatten layer.
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {prediction.warnings && prediction.warnings.length > 0 && (
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>Model Advisory & Edge Warnings:</span>
                    </div>
                    {prediction.warnings.map((w, idx) => (
                      <div key={idx} className="text-amber-200/90 pl-5 list-disc">
                        • {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7-Day Input Sequence Table */}
              <div className="p-6 rounded-2xl border border-border surface-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    7-Day Preceding Historical Observations Window
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Input Tensor Shape: (1, 7, 91)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Day</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">AQI</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">PM2.5</th>
                        <th className="px-4 py-3">PM10</th>
                        <th className="px-4 py-3">NO2</th>
                        <th className="px-4 py-3">SO2</th>
                        <th className="px-4 py-3">CO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono">
                      {prediction.historical_sequence.map((obs, idx) => (
                        <tr key={obs.date} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-slate-400">Day {idx + 1}</td>
                          <td className="px-4 py-3 font-semibold text-white">{obs.date}</td>
                          <td className="px-4 py-3 font-bold text-white">{obs.aqi}</td>
                          <td className="px-4 py-3 font-sans">
                            <Badge category={obs.aqi_category} aqi={obs.aqi} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-slate-300">{obs.pm25 ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{obs.pm10 ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{obs.no2 ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{obs.so2 ?? '—'}</td>
                          <td className="px-4 py-3 text-slate-300">{obs.co ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
