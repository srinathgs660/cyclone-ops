import React from 'react';
import { Wind, Compass, Gauge, AlertCircle, Clock, MapPin, Eye } from 'lucide-react';
import RiskBadge from './RiskBadge';

const CycloneInfoPanel = ({ cyclone, onTrackClick }) => {
  if (!cyclone) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-5 text-center text-slate-400">
        <p>No active cyclone in immediate radar tracking range.</p>
      </div>
    );
  }

  const wind = cyclone.windSpeed || 0;
  const pressure = cyclone.pressure || 0;
  const coords = cyclone.currentLocation?.coordinates || [0, 0];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin-slow">🌀</span>
            <h3 className="text-lg font-bold tracking-tight text-white uppercase font-mono">{cyclone.name}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">Source: {cyclone.source} • Status: <span className="text-rose-400 font-semibold">{cyclone.status}</span></p>
        </div>
        <RiskBadge level={cyclone.category?.includes('4') || cyclone.category?.includes('5') ? 'CRITICAL' : 'VERY_HIGH'} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Wind className="h-3.5 w-3.5 text-cyan-400" />
            <span>Wind Velocity</span>
          </div>
          <p className="mt-1 text-lg font-bold font-mono text-cyan-300">{wind} <span className="text-xs font-normal text-slate-400">km/h</span></p>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-amber-400" />
            <span>Central Baro</span>
          </div>
          <p className="mt-1 text-lg font-bold font-mono text-amber-300">{pressure} <span className="text-xs font-normal text-slate-400">hPa</span></p>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Compass className="h-3.5 w-3.5 text-blue-400" />
            <span>Movement</span>
          </div>
          <p className="mt-1 text-lg font-bold font-mono text-blue-300">{cyclone.movementDirection} @ {cyclone.movementSpeed} <span className="text-xs font-normal text-slate-400">km/h</span></p>
        </div>

        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-rose-400" />
            <span>Eye Coords</span>
          </div>
          <p className="mt-1 text-sm font-bold font-mono text-slate-200">{coords[1]?.toFixed(2)}°N, {coords[0]?.toFixed(2)}°E</p>
        </div>
      </div>

      {cyclone.landfallEstimate && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 animate-pulse" />
            <div>
              <span className="font-semibold uppercase tracking-wider">Estimated Landfall:</span> {cyclone.landfallEstimate.locationName}
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>T-18 Hours</span>
          </div>
        </div>
      )}

      {onTrackClick && (
        <button
          onClick={onTrackClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-200 transition-colors hover:bg-cyan-500/30"
        >
          <Eye className="h-3.5 w-3.5" />
          Focus GIS Radar on Cyclone
        </button>
      )}
    </div>
  );
};

export default CycloneInfoPanel;
