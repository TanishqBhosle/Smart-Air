import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '../common/Badge';

interface KPICardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  change?: number | null;
  changeLabel?: string;
  badgeCategory?: string | null;
  badgeAqi?: number | null;
  isModelPrediction?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  change,
  changeLabel = 'vs yesterday',
  badgeCategory,
  badgeAqi,
  isModelPrediction = false,
}) => {
  const displayVal = value !== null && value !== undefined ? value : '—';

  return (
    <div
      className={`relative p-5 rounded-xl border transition-all surface-card ${
        isModelPrediction
          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-surface to-surface'
          : 'border-border'
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">
          {title}
        </span>
        <div
          className={`p-2 rounded-lg ${
            isModelPrediction
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800/80 text-slate-400 border border-slate-700/60'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {displayVal}
        </span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {/* Footer / Badges / Trend */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
        {badgeCategory !== undefined || badgeAqi !== undefined ? (
          <Badge category={badgeCategory} aqi={badgeAqi} size="sm" />
        ) : change !== undefined && change !== null ? (
          <div className="flex items-center gap-1.5">
            {change > 0 ? (
              <span className="flex items-center text-rose-400 font-semibold font-mono">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{change}
              </span>
            ) : change < 0 ? (
              <span className="flex items-center text-emerald-400 font-semibold font-mono">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{change}
              </span>
            ) : (
              <span className="flex items-center text-slate-400 font-mono">
                <Minus className="w-3.5 h-3.5 mr-0.5" />0
              </span>
            )}
            <span className="text-slate-500 text-[11px]">{changeLabel}</span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>
        ) : (
          <span className="text-slate-500 text-[11px]">Sensor observation</span>
        )}

        {isModelPrediction && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ANN Output
          </span>
        )}
      </div>
    </div>
  );
};

