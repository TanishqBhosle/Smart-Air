import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategoryDistribution } from '../../types';

interface CategoryPieChartProps {
  data: CategoryDistribution[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="p-5 rounded-xl border border-border surface-card flex flex-col justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          AQI Category Distribution
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Proportion of air quality days across health severity tiers
        </p>
      </div>

      <div className="h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              stroke="#090D16"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryDistribution;
                  return (
                    <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.category}
                      </div>
                      <div className="text-slate-400 font-mono">
                        {item.count} days ({item.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-white font-mono">{total}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Total Days
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate text-[11px]">{item.category}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400 font-medium">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

