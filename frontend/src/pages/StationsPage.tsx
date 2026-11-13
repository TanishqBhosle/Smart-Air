import React, { useEffect, useState } from 'react';
import {
  Radio,
  Search,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { api } from '../services/api';
import { Station, StationDetail } from '../types';
import { formatDate } from '../utils/colors';

export const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<StationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    api.getStations()
      .then((data) => {
        if (!isMounted) return;
        setStations(data);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const cities = ['all', ...Array.from(new Set(stations.map((s) => s.city))).sort()];

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.station_name.toLowerCase().includes(search.toLowerCase()) ||
      s.station_id.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === 'all' || s.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const handleSelectStation = async (stationId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getStationDetail(stationId);
      setSelectedStation(detail);
    } catch {
      // fallback
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Air Quality Monitoring Network
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {stations.length} Stations Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Continuous Ambient Air Quality Monitoring Stations across India in the dataset
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="Search stations, cities, IDs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* City Filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-surface border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Cities' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner label="Loading station directory..." />
          ) : filteredStations.length === 0 ? (
            <EmptyState
              title="No monitoring stations found"
              description="Try adjusting your search criteria or city filter."
              actionText="Reset Filters"
              onAction={() => {
                setSearch('');
                setCityFilter('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map((station) => (
                <div
                  key={station.station_id}
                  onClick={() => handleSelectStation(station.station_id)}
                  className="p-5 rounded-xl border border-border surface-card hover:border-slate-600 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {station.station_id}
                      </div>
                      <Badge
                        category={station.latest_category}
                        aqi={station.latest_aqi}
                        size="sm"
                      />
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {station.station_name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{station.city}, {station.state}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">
                        Avg AQI
                      </div>
                      <div className="font-mono font-bold text-white text-sm">
                        {station.average_aqi ?? '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">
                        Records
                      </div>
                      <div className="font-mono text-slate-300">
                        {station.total_records}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">
                        Coverage
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {station.first_date.slice(0, 4)} – {station.last_date.slice(0, 4)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Station Details Modal */}
          {selectedStation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-surface-elevated p-6 space-y-5 shadow-2xl relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-emerald-400 font-semibold">
                      {selectedStation.station_id}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-0.5">
                      {selectedStation.station_name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {selectedStation.city}, {selectedStation.state}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      Average AQI
                    </span>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStation.average_aqi}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      Latest AQI
                    </span>
                    <div className="text-lg font-bold font-mono text-white mt-0.5">
                      {selectedStation.latest_aqi}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      Date Span
                    </span>
                    <div className="text-xs font-mono text-slate-300 mt-1">
                      {selectedStation.first_date} to {selectedStation.last_date}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      Valid 7-Day Forecast Dates
                    </span>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {selectedStation.valid_prediction_dates_count} dates available
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Sensors & Measured Pollutants
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStation.available_pollutants.map((p) => (
                      <span
                        key={p}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
