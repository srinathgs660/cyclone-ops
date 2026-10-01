import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, RefreshCw, Users, AlertTriangle, Building2, Anchor, Zap } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { useSocket } from '../context/SocketContext';

const ImpactAssessment = () => {
  const [zones, setZones] = useState([]);
  const [stats, setStats] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchAssessment();
  }, [lastUpdated]);

  const fetchAssessment = async () => {
    try {
      const res = await axios.get('/api/risk/assessment');
      if (res.data.success) {
        setZones(res.data.zones);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('[Impact Assessment Error]:', err);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await axios.post('/api/risk/recalculate');
      await fetchAssessment();
    } catch (err) {
      console.error('[Recalculate Error]:', err);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Impact Prediction & Dynamic Risk Scoring Engine
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Multi-criteria algorithmic risk evaluation factoring wind radius, storm surge, population vulnerability, and infrastructure exposure
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-200 hover:bg-cyan-500/30 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? 'Recalculating...' : 'Force Risk Recalculation'}
        </button>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
            <span className="text-xs font-mono uppercase text-rose-300">Critical Sectors</span>
            <p className="mt-1 text-2xl font-bold font-mono text-rose-400">{stats.critical}</p>
            <span className="text-[10px] text-slate-400">Risk Score &gt; 80</span>
          </div>

          <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-4">
            <span className="text-xs font-mono uppercase text-orange-300">Very High Risk</span>
            <p className="mt-1 text-2xl font-bold font-mono text-orange-400">{stats.veryHigh}</p>
            <span className="text-[10px] text-slate-400">Risk Score 61 - 80</span>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <span className="text-xs font-mono uppercase text-amber-300">High Risk</span>
            <p className="mt-1 text-2xl font-bold font-mono text-amber-400">{stats.high}</p>
            <span className="text-[10px] text-slate-400">Risk Score 41 - 60</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4">
            <span className="text-xs font-mono uppercase text-slate-400">Total Population Exposed</span>
            <p className="mt-1 text-2xl font-bold font-mono text-white">{(stats.totalPopulationAtRisk / 1000000).toFixed(2)}M</p>
            <span className="text-[10px] text-slate-500">Across 6 Coastal Zones</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4">
            <span className="text-xs font-mono uppercase text-slate-400">Vulnerable Citizens</span>
            <p className="mt-1 text-2xl font-bold font-mono text-cyan-300">{stats.totalVulnerable?.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">Elderly, Infants & Disabled</span>
          </div>
        </div>
      )}

      {/* Risk Scoring Formula Legend Card */}
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 text-xs">
        <p className="font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
          Dynamic Risk Scoring Algorithm Formula:
        </p>
        <p className="font-mono text-cyan-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          Risk Score = (Cyclone Proximity & Intensity × 0.40) + (Demographic Vulnerability × 0.20) + (Infrastructure Density × 0.15) + (Road Inaccessibility × 0.15) + (Shelter Deficit × 0.10)
        </p>
      </div>

      {/* Zones Table */}
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Sector Vulnerability Ranking Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/80 font-mono text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Sector Name & Region</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Distance to Eye</th>
                <th className="p-3.5">Population Exposed</th>
                <th className="p-3.5">Critical Infra</th>
                <th className="p-3.5">Surge Est</th>
                <th className="p-3.5">Road Access</th>
                <th className="p-3.5">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {zones.map((z) => (
                <tr key={z._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <strong className="text-white block">{z.name}</strong>
                    <span className="text-[11px] text-slate-500">{z.region}</span>
                  </td>
                  <td className="p-3.5">
                    <RiskBadge level={z.riskLevel} score={z.riskScore} />
                  </td>
                  <td className="p-3.5 font-mono text-slate-200">{z.cycloneDistanceKm || 135} km</td>
                  <td className="p-3.5 font-mono">
                    {z.population?.toLocaleString()}
                    <span className="block text-[10px] text-slate-500">({z.vulnerablePopulation?.toLocaleString()} vuln)</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span title="Hospitals">🏥 {z.infrastructureExposure?.hospitals || 0}</span>
                      <span title="Power Stations">⚡ {z.infrastructureExposure?.powerStations || 0}</span>
                      <span title="Bridges">🌉 {z.infrastructureExposure?.bridges || 0}</span>
                      <span title="Ports">⚓ {z.infrastructureExposure?.ports || 0}</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-amber-300">{z.stormSurgeHeightMeters || 2.5}m</td>
                  <td className="p-3.5 font-mono">{z.roadAccessibilityPercent || 70}%</td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-rose-400">{z.evacuationPriority}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImpactAssessment;
