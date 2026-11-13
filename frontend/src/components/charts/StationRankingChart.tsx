import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { StationComparison } from '../../types';
import { getCategoryStyle } from '../../utils/colors';

interface StationRankingChartProps {
  data: StationComparison[];
}

export const StationRankingChart: React.FC<StationRankingChartProps> = ({ data }) => {
  return (
    <div className="p-5 rounded-xl border border-border surface-card flex flex-col justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Regional Pollution Severity Comparison
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Top monitoring stations ranked by historical average AQI
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 25, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" horizontal={false} />
            <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="station_id"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              width={50}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as StationComparison;
                  const cat = getCategoryStyle(item.average_aqi);
                  return (
                    <div className="p-3 rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-white">
                        {item.station_name} ({item.station_id})
                      </div>
                      <div className="text-slate-400">{item.city}</div>
                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-lg font-bold font-mono text-white">
                          {item.average_aqi}
                        </span>
                        <span className="text-[11px]" style={{ color: cat.color }}>
                          Avg AQI ({cat.label})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Max recorded: {item.max_aqi} | Records: {item.record_count}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="average_aqi" radius={[0, 4, 4, 0]}>
              {data.map((entry) => {
                const style = getCategoryStyle(entry.average_aqi);
                return <Cell key={entry.station_id} fill={style.color} fillOpacity={0.85} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 text-right font-mono">
        Filter criteria: &gt;= 30 recorded observation days
      </div>
    </div>
  );
};

