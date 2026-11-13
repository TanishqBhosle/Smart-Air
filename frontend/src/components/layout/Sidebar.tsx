import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Radio,
  Cpu,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const items = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'AQI Predictions', to: '/predictions', icon: Sparkles },
    { name: 'Monitoring Stations', to: '/stations', icon: Radio },
    { name: 'Model Insights', to: '/model-insights', icon: Cpu },
  ];

  return (
    <aside className="w-64 border-r border-border bg-[#0B1120] flex flex-col justify-between p-4 shrink-0 hidden lg:flex">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
            Intelligence Platform
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Dataset context card */}
        <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Academic Pipeline</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Strict chronological 7-day lookback window prevents data leakage. Target is strictly next-day AQI.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>CPCB India Dataset</span>
            <span>108k Records</span>
          </div>
        </div>
      </div>

      {/* Footer details */}
      <div className="border-t border-slate-800/80 pt-4 px-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>SmartAir Engine</span>
          <span className="font-mono text-emerald-400">MLP 128-64</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Validation RMSE 48.81 | R² 0.87
        </div>
      </div>
    </aside>
  );
};

