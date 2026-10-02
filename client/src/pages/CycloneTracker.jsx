import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wind, Compass, Gauge, AlertCircle, Clock, MapPin, Radio, Shield, Globe, RefreshCw, CheckCircle2, Navigation, Layers } from 'lucide-react';
import CommandMap from '../maps/CommandMap';
import RiskBadge from '../components/RiskBadge';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

const CycloneTracker = () => {
  const [cyclones, setCyclones] = useState([]);
  const [selectedCyclone, setSelectedCyclone] = useState(null);
  const [selectedBasin, setSelectedBasin] = useState('all');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const { lastUpdated } = useSocket();
  const { isLight } = useTheme();

  useEffect(() => {
    fetchCyclones(selectedBasin);
  }, [lastUpdated, selectedBasin]);

  const fetchCyclones = async (basin = 'all') => {
    try {
      setLoading(true);
      const url = basin === 'all' 
        ? '/api/cyclones/active' 
        : `/api/cyclones/active?basin=${basin}`;
      const res = await axios.get(url);

      if (res.data.success && res.data.data.length > 0) {
        setCyclones(res.data.data);
        if (res.data.lastSyncTime) {
          setLastSyncTime(new Date(res.data.lastSyncTime));
        }
        // Auto-select first storm or keep current if still in list
        setSelectedCyclone(prev => {
          if (!prev) return res.data.data[0];
          const found = res.data.data.find(c => c._id === prev._id || c.name === prev.name);
          return found || res.data.data[0];
        });
      }
    } catch (err) {
      console.error('[Cyclone Tracker Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLiveSync = async () => {
    try {
      setSyncing(true);
      setSyncSuccessMsg('');
      const res = await axios.post('/api/cyclones/sync-live');
      if (res.data.success) {
        setCyclones(res.data.data);
        setLastSyncTime(new Date());
        setSyncSuccessMsg(`Synchronized ${res.data.count} active storms worldwide from NASA EONET & GDACS`);
        if (res.data.data.length > 0) {
          setSelectedCyclone(res.data.data[0]);
        }
        setTimeout(() => setSyncSuccessMsg(''), 6000);
      }
    } catch (err) {
      console.error('[Sync Error]:', err);
    } finally {
      setSyncing(false);
    }
  };

  const basins = [
    { id: 'all', label: 'All Worldwide Storms', icon: '🌍' },
    { id: 'indian-ocean', label: 'Indian Ocean / Bay of Bengal', icon: '🇮🇳' },
    { id: 'pacific', label: 'Pacific Ocean (Typhoons)', icon: '🇯🇵' },
    { id: 'atlantic', label: 'Atlantic & East Pacific', icon: '🇺🇸' }
  ];

  const filteredCyclones = cyclones.filter(c => {
    if (selectedBasin === 'all') return true;
    return c.basinCode === selectedBasin || c.metadata?.basinCode === selectedBasin;
  });

  const activeStorm = selectedCyclone || (filteredCyclones.length > 0 ? filteredCyclones[0] : null);
  const coords = activeStorm?.currentLocation?.coordinates || [80.27, 13.08];

  return (
    <div className="space-y-6">
      {/* Real-Time Telemetry Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#0F172A] via-[#131D31] to-[#0F172A] p-4 shadow-xl light-adapt-box">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-white font-mono">
                  Live Global Tropical Cyclone Tracking
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME FEEDS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-satellite telemetry feeds: <strong className="text-slate-300">NASA EONET</strong> • <strong className="text-slate-300">GDACS (UN-OCHA)</strong> • <strong className="text-slate-300">JTWC</strong> • <strong className="text-slate-300">NOAA NHC</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400">Last Satellite Ping</span>
                <span className="font-mono text-cyan-400 font-semibold">{lastSyncTime.toLocaleTimeString()}</span>
              </div>
            )}

            <button
              onClick={handleManualLiveSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg border border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing Satellite Feeds...' : 'Refresh Live Feeds'}
            </button>
          </div>
        </div>

        {syncSuccessMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Ocean Basin Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {basins.map(b => {
          const isSelected = selectedBasin === b.id;
          const count = b.id === 'all' 
            ? cyclones.length 
            : cyclones.filter(c => c.basinCode === b.id || c.metadata?.basinCode === b.id).length;

          return (
            <button
              key={b.id}
              onClick={() => setSelectedBasin(b.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition font-mono border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-750 hover:text-slate-200'
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.label}</span>
              <span className={`rounded-full px-2 py-0.2 text-[10px] ${
                isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-700 text-slate-300'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Storm Selector Cards */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filteredCyclones.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No active tropical storms currently reported in this ocean sector.</p>
        ) : (
          filteredCyclones.map(c => {
            const isCurrent = activeStorm?._id === c._id || activeStorm?.name === c.name;
            return (
              <button
                key={c._id || c.name}
                onClick={() => setSelectedCyclone(c)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                  isCurrent
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                    : 'border-slate-800 bg-[#131D31]/80 hover:border-slate-700 hover:bg-slate-800/80 light-adapt-box'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-600 text-base shadow">
                  {c.flag || '🌀'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white font-mono uppercase">{c.name}</span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 font-mono">
                      {c.category}
                    </span>
                    {(c.name?.toLowerCase().includes('amara') || c.isDemo || c.isScenario) && (
                      <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[8px] font-bold text-amber-300 font-mono">
                        🎯 DEMO SCENARIO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span className="text-cyan-300 font-bold">{c.windSpeed} km/h</span>
                    <span>•</span>
                    <span>{c.basin || c.subBasin || 'Global'}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Active Storm Deep Telemetry Grid */}
      {activeStorm && (
        <>
          {(activeStorm.name?.toLowerCase().includes('amara') || activeStorm.isDemo || activeStorm.isScenario) && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300 font-mono">
              <span className="text-lg shrink-0">🎯</span>
              <div>
                <strong className="text-amber-200">EOC MISSION BENCHMARK (DEMO SCENARIO DATA):</strong>{' '}
                <span className="text-amber-300/90">
                  This cyclone is an operational simulation based on historical IMD/JTWC track models to power local Tamil Nadu evacuation planning, risk maps, and shelter allocations during clear weather.
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-3.5 light-adapt-box shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono">Intensity Category</p>
              <p className="mt-1 text-base font-extrabold text-rose-400 font-mono">{activeStorm.category}</p>
              <span className="text-[10px] text-slate-500">Saffir-Simpson Scale</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-3.5 light-adapt-box shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono">Sustained Wind Speed</p>
              <p className="mt-1 text-base font-extrabold text-cyan-300 font-mono">{activeStorm.windSpeed} km/h</p>
              <span className="text-[10px] text-slate-500">Gusts ~{Math.round(activeStorm.windSpeed * 1.25)} km/h</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-3.5 light-adapt-box shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono">Central Barometric</p>
              <p className="mt-1 text-base font-extrabold text-amber-300 font-mono">{activeStorm.pressure} hPa</p>
              <span className="text-[10px] text-slate-500">Core Pressure Anomaly</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-3.5 light-adapt-box shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono">Movement Vector</p>
              <p className="mt-1 text-base font-extrabold text-blue-300 font-mono">
                {activeStorm.movementDirection} @ {activeStorm.movementSpeed} km/h
              </p>
              <span className="text-[10px] text-slate-500">Bearing ~{activeStorm.movementBearing || 295}°</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-3.5 light-adapt-box shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono">Eye GPS Coordinate</p>
              <p className="mt-1 text-sm font-extrabold text-slate-200 font-mono">
                {coords[1]?.toFixed(2)}°, {coords[0]?.toFixed(2)}°
              </p>
              <span className="text-[10px] text-cyan-400">{activeStorm.basin || 'Ocean Sector'}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-3.5 light-adapt-box shadow-sm">
              <p className="text-[10px] uppercase text-slate-400 font-mono">Landfall Target</p>
              <p className="mt-1 text-xs font-bold text-rose-300 font-mono truncate">
                {activeStorm.landfallEstimate?.locationName || 'Maritime Path'}
              </p>
              <span className="text-[10px] text-rose-400 font-bold">Estimated T-18h</span>
            </div>
          </div>

          {/* Interactive Global Command Map & Trajectory Corridor */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[550px]">
              <CommandMap
                cyclones={cyclones.length > 0 ? cyclones : [activeStorm]}
                selectedCycloneId={activeStorm?._id || activeStorm?.name}
                onCycloneSelect={(c) => setSelectedCyclone(c)}
                centerCoords={[coords[1] || 13.08, coords[0] || 80.27]}
                zoom={6}
              />
            </div>

            {/* Numerical Prediction Trajectory & Telemetry Details */}
            <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl flex flex-col justify-between light-adapt-box">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                      72-Hour Numerical Trajectory
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {activeStorm.source || 'NASA / JTWC Ensemble Feed'}
                    </span>
                  </div>
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                    CONE ± 67%
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-80 pr-1">
                  {(activeStorm.forecastTrack || []).map((pt, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-300">Fix +{(idx + 1) * 6}h</span>
                        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 font-mono">
                          {pt.category}
                        </span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-slate-400 font-mono text-[11px]">
                        <div>Wind: <strong className="text-slate-200">{pt.windSpeed} km/h</strong></div>
                        <div>Baro: <strong className="text-slate-200">{pt.pressure} hPa</strong></div>
                        <div>GPS: {pt.coordinates[1]}°, {pt.coordinates[0]}°</div>
                        <div>Uncertainty: ±{pt.uncertaintyRadiusKm} km</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-slate-800 pt-3 text-[11px] text-slate-400 font-mono">
                Historical track has {activeStorm.pastTrack?.length || 0} orbital fixes. Projections calculated via atmospheric steering currents and Coriolis parameter modeling.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CycloneTracker;
