import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PollutantPoint } from '../../types';

interface PollutantChartProps {
  data: PollutantPoint[];
}

interface PollutantConfig {
  key: keyof PollutantPoint;
  label: string;
  color: string;
  defaultVisible: boolean;
}

const POLLUTANTS: PollutantConfig[] = [
  { key: 'pm25', label: 'PM2.5 (µg/m³)', color: '#10B981', defaultVisible: true },
  { key: 'pm10', label: 'PM10 (µg/m³)', color: '#06B6D4', defaultVisible: true },
  { key: 'no2', label: 'NO2 (µg/m³)', color: '#F59E0B', defaultVisible: true },
  { key: 'so2', label: 'SO2 (µg/m³)', color: '#8B5CF6', defaultVisible: false },
  { key: 'co', label: 'CO (mg/m³)', color: '#EC4899', defaultVisible: false },
  { key: 'o3', label: 'O3 (µg/m³)', color: '#3B82F6', defaultVisible: false },
];

export const PollutantChart: React.FC<PollutantChartProps> = ({ data }) => {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    pm25: true,
    pm10: true,
    no2: true,
    so2: false,
    co: false,
    o3: false,
  });

  const toggle = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = data.slice(-60); // Last 60 observations

  return (
    <div className="p-5 rounded-xl border border-border surface-card flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Pollutant Concentration Dynamics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key particulate matter and gaseous contaminant concentrations
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {POLLUTANTS.map((p) => {
            const isVis = visible[p.key as string];
            return (
              <button
                key={p.key as string}
                onClick={() => toggle(p.key as string)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all ${
                  isVis
                    ? 'border-transparent text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                }`}
                style={isVis ? { backgroundColor: `${p.color}25`, borderColor: p.color, color: p.color } : {}}
              >
                {p.key.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            {POLLUTANTS.map((p) => {
              if (!visible[p.key as string]) return null;
              return (
                <Line
                  key={p.key as string}
                  type="monotone"
                  dataKey={p.key as string}
                  name={p.label}
                  stroke={p.color}
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

