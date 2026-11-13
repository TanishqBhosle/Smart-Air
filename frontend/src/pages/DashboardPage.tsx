import React, { useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  Radio,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { KPICard } from '../components/dashboard/KPICard';
import { AQITrendChart } from '../components/charts/AQITrendChart';
import { PollutantChart } from '../components/charts/PollutantChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { StationRankingChart } from '../components/charts/StationRankingChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../services/api';
import {
  Station,
  DashboardSummary,
  AQIPoint,
  PollutantPoint,
  CategoryDistribution,
  StationComparison,
} from '../types';
import { formatDate } from '../utils/colors';

export const DashboardPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('DL001');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [aqiTrend, setAqiTrend] = useState<AQIPoint[]>([]);
  const [pollutantsTrend, setPollutantsTrend] = useState<PollutantPoint[]>([]);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [comparisons, setComparisons] = useState<StationComparison[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stationSearch, setStationSearch] = useState<string>('');

  // Initial load: stations list and comparisons
  useEffect(() => {
    let isMounted = true;
    api.getStations()
      .then((stList) => {
        if (!isMounted) return;
        setStations(stList);
        if (stList.length > 0 && !stList.some((s) => s.station_id === selectedStationId)) {
          setSelectedStationId(stList[0].station_id);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load monitoring stations');
      });

    api.getStationComparisons(8)
      .then((comps) => {
        if (isMounted) setComparisons(comps);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Whenever selectedStationId changes, fetch summary, aqiTrend, pollutantsTrend, categories
  useEffect(() => {
    if (!selectedStationId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getDashboardSummary(selectedStationId),
      api.getAQITrend(selectedStationId, 180),
      api.getPollutantsTrend(selectedStationId, 90),
      api.getCategoryDistribution(selectedStationId),
    ])
      .then(([sumData, aqiData, polData, catData]) => {
        setSummary(sumData);
        setAqiTrend(aqiData);
        setPollutantsTrend(polData);
        setCategories(catData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data for station');
        setLoading(false);
      });
  }, [selectedStationId]);

  const filteredStations = stations.filter(
    (s) =>
      s.station_name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.station_id.toLowerCase().includes(stationSearch.toLowerCase()) ||
      s.city.toLowerCase().includes(stationSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Bar: Title & Station Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Environmental Analytics Workspace
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {summary?.station_id || selectedStationId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summary?.station_name || 'Monitoring Station Overview'} •{' '}
                {summary?.latest_date ? `Latest Observation: ${formatDate(summary.latest_date)}` : 'Dataset Historical Record'}
              </p>
            </div>

            {/* Station Dropdown with Search */}
            <div className="flex items-center gap-3">
              <div className="relative min-w-[240px]">
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-surface border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
                >
                  {stations.map((s) => (
                    <option key={s.station_id} value={s.station_id}>
                      {s.city} — {s.station_name} ({s.station_id})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <Radio className="w-3.5 h-3.5" />
                </div>
              </div>

              <button
                onClick={() => setSelectedStationId((prev) => prev)}
                title="Refresh metrics"
                className="p-2 rounded-lg bg-surface border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <span className="font-semibold">Data Retrieval Error:</span> {error}
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSpinner label="Querying historical monitoring observations..." size="lg" />
          ) : (
            <>
              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Latest Available AQI"
                  value={summary?.latest_aqi}
                  unit="AQI"
                  icon={Activity}
                  badgeAqi={summary?.latest_aqi}
                  badgeCategory={summary?.aqi_category}
                  change={summary?.aqi_change}
                  changeLabel="vs prev day"
                />

                <KPICard
                  title="Previous Day AQI"
                  value={summary?.previous_aqi}
                  unit="AQI"
                  icon={Calendar}
                  badgeAqi={summary?.previous_aqi}
                  subtitle="Consecutive daily lag"
                />

                <KPICard
                  title="Dominant Contaminant"
                  value={summary?.dominant_pollutant || 'PM2.5'}
                  unit={summary?.dominant_pollutant_value ? `${summary.dominant_pollutant_value} µg/m³` : undefined}
                  icon={TrendingUp}
                  subtitle="Highest concentration driver"
                />

                <KPICard
                  title="Predicted Next-Day AQI"
                  value={summary?.predicted_next_day_aqi || 'Ready'}
                  unit={summary?.predicted_next_day_aqi ? 'AQI' : undefined}
                  icon={Sparkles}
                  isModelPrediction={true}
                  badgeCategory={summary?.predicted_aqi_category}
                  subtitle="7-day neural network forecast"
                />
              </div>

              {/* Main AQI Trend Line */}
              <AQITrendChart
                data={aqiTrend}
                predictedAQI={summary?.predicted_next_day_aqi}
              />

              {/* Pollutants Breakdown */}
              <PollutantChart data={pollutantsTrend} />

              {/* Category Breakdown & Regional Comparisons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPieChart data={categories} />
                <StationRankingChart data={comparisons} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
