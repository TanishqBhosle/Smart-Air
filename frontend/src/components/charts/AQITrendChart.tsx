import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { AQIPoint } from '../../types';
import { getCategoryStyle } from '../../utils/colors';

interface AQITrendChartProps {
  data: AQIPoint[];
  predictedAQI?: number | null;
  predictedDate?: string | null;
}

export const AQITrendChart: React.FC<AQITrendChartProps> = ({
  data,
  predictedAQI,
  predictedDate,
}) => {
  const [range, setRange] = useState<number>(90);

  // Filter data by selected limit
  const filteredData = range > 0 ? data.slice(-range) : data;

  // Prepare chart series with predicted point appended if available
  const chartData = [...filteredData];
  if (predictedAQI !== undefined && predictedAQI !== null && predictedDate) {
    const predCat = getCategoryStyle(predictedAQI);
    chartData.push({
      date: predictedDate,
      aqi: predictedAQI,
      category: `${predCat.label} (Predicted)`,
      category_color: predCat.color,
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const point = payload[0].payload;
      const isPredicted = point.category?.includes('Predicted');
      const catStyle = getCategoryStyle(val);

      return (
        <div className="p-3 rounded-lg border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 font-mono text-slate-400">
            <span>{label}</span>
            {isPredicted && (
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                Forecast
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">{val}</span>
            <span className="text-slate-400 font-mono text-[11px]">AQI</span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: catStyle.color }}
            />
            <span className="font-medium" style={{ color: catStyle.color }}>
              {catStyle.label}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-xl border border-border surface-card flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Air Quality Index Trend
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Station Time Series
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daily historical observations with National AQI reference thresholds
          </p>
        </div>

        {/* Range selectors */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium self-start sm:self-auto">
          {[
            { label: '30D', val: 30 },
            { label: '90D', val: 90 },
            { label: '180D', val: 180 },
            { label: 'All', val: 0 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.val)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                range === r.val
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} />

            {/* Threshold lines */}
            <ReferenceLine y={50} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={100} stroke="#34D399" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={200} stroke="#FBBF24" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={300} stroke="#F97316" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={400} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.4} />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#aqiGradient)"
              activeDot={{ r: 5, fill: '#10B981', stroke: '#090D16', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Good (0-50)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34D399]" /> Satisfactory (51-100)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]" /> Moderate (101-200)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" /> Poor (201-300)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Very Poor (301-400)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Severe (&gt;400)
          </span>
        </div>
      </div>
    </div>
  );
};

