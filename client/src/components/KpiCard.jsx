import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const KpiCard = ({ title, value, delta, status, icon: Icon, color = 'cyan', onClick }) => {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400/60 bg-cyan-500/10',
    red: 'border-rose-500/30 text-rose-400 group-hover:border-rose-400/60 bg-rose-500/10',
    amber: 'border-amber-500/30 text-amber-400 group-hover:border-amber-400/60 bg-amber-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400/60 bg-emerald-500/10',
    purple: 'border-purple-500/30 text-purple-400 group-hover:border-purple-400/60 bg-purple-500/10',
    blue: 'border-blue-500/30 text-blue-400 group-hover:border-blue-400/60 bg-blue-500/10'
  };

  const isPositiveDelta = delta && delta.includes('+');

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan-900/20 ${onClick ? 'cursor-pointer hover:border-slate-600' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
            {status && (
              <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                {status}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 border ${colorMap[color] || colorMap.cyan}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
        {delta ? (
          <span className={`flex items-center gap-1 font-medium ${isPositiveDelta ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isPositiveDelta ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {delta}
          </span>
        ) : (
          <span className="text-slate-500">Real-time Telemetry</span>
        )}

        {onClick && (
          <span className="flex items-center gap-1 text-[11px] text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
            View details <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
