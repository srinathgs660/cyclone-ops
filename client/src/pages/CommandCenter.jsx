import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Compass, Radio, ShieldAlert, Users, Home, AlertOctagon,
  LifeBuoy, Truck, ArrowUpRight, Activity, Clock, RefreshCw
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import SimulationBar from '../components/SimulationBar';
import CycloneInfoPanel from '../components/CycloneInfoPanel';
import CommandMap from '../maps/CommandMap';
import { useSocket } from '../context/SocketContext';

const CommandCenter = () => {
  const navigate = useNavigate();
  const { lastUpdated, syncRealtimeCyclones, isSyncing } = useSocket();

  const [kpis, setKpis] = useState({
    activeDisasters: { value: '7', delta: '↑ 2 today' },
    activeCyclones: { value: '2', status: 'LIVE' },
    highRiskZones: { value: '6', delta: '↑ 4' },
    peopleAtRisk: { value: '1.2M', delta: '↑ 8.2%' },
    evacuationProgress: { value: '68.4%' },
    shelterCapacity: { value: '74%' },
    criticalIncidents: { value: '14', delta: '↓ 12%' },
    reliefStockStatus: { value: '86%', status: 'Available' }
  });

  const [cyclones, setCyclones] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [responseTeams, setResponseTeams] = useState([]);
  const [evacuationPlans, setEvacuationPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [lastUpdated]);

  const loadDashboardData = async () => {
    try {
      const [kpiRes, cycRes, riskRes, shlRes, incRes, tmRes, evacRes] = await Promise.all([
        axios.get('/api/analytics/kpis').catch(() => ({ data: null })),
        axios.get('/api/cyclones/active').catch(() => ({ data: null })),
        axios.get('/api/risk/zones').catch(() => ({ data: null })),
        axios.get('/api/shelters').catch(() => ({ data: null })),
        axios.get('/api/incidents?status=ASSIGNED').catch(() => ({ data: null })),
        axios.get('/api/response-teams').catch(() => ({ data: null })),
        axios.get('/api/evacuations').catch(() => ({ data: null }))
      ]);

      if (kpiRes?.data?.success) setKpis(kpiRes.data.data);
      if (cycRes?.data?.success && cycRes.data.data) {
        setCyclones(cycRes.data.data);
        setKpis(prev => ({
          ...prev,
          activeCyclones: {
            value: String(cycRes.data.data.length),
            status: 'LIVE GLOBAL'
          }
        }));
      }
      if (riskRes?.data?.success) setRiskZones(riskRes.data.data);
      if (shlRes?.data?.success) setShelters(shlRes.data.data);
      if (incRes?.data?.success) setIncidents(incRes.data.data);
      if (tmRes?.data?.success) setResponseTeams(tmRes.data.data);
      if (evacRes?.data?.success) setEvacuationPlans(evacRes.data.data);
    } catch (err) {
      console.error('[Dashboard Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const primaryCyclone = cyclones.find(c => c.name?.includes('Amara')) || cyclones[0] || null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xl font-extrabold tracking-wider text-white uppercase font-mono">
              Disaster Operations Command Center
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time cyclone tracking, impact prediction, evacuation planning, and relief coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-mono text-slate-300">
            Readiness: <strong className="text-emerald-400">LEVEL-1 RED</strong>
          </span>
          <button
            onClick={() => syncRealtimeCyclones()}
            disabled={isSyncing}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-3 py-1 text-xs font-bold text-cyan-300 hover:from-cyan-500/30 hover:to-blue-600/30 transition shadow-lg font-mono disabled:opacity-50"
            title="Fetch latest real-time cyclone telemetry from IMD, NOAA & NASA satellites"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-cyan-300'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Refresh Real-Time'}</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/cyclones')}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition shadow-lg font-mono"
            title="Open Live Worldwide Cyclone Radar"
          >
            <span>🌍</span>
            <span>Live Global Radar ({cyclones.length})</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/citizen')}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-500/20 px-3.5 py-1 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition shadow-lg"
          >
            Citizen SOS Portal
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Demonstration Scenario Ribbon */}
      <SimulationBar />

      {/* Top 8 KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 2xl:grid-cols-8">
        <KpiCard
          title="Active Disasters"
          value={kpis.activeDisasters.value}
          delta={kpis.activeDisasters.delta}
          icon={AlertOctagon}
          color="red"
          onClick={() => navigate('/dashboard/risk')}
        />
        <KpiCard
          title="Active Cyclones"
          value={kpis.activeCyclones.value}
          status={kpis.activeCyclones.status}
          icon={Radio}
          color="cyan"
          onClick={() => navigate('/dashboard/cyclones')}
        />
        <KpiCard
          title="High-Risk Zones"
          value={kpis.highRiskZones.value}
          delta={kpis.highRiskZones.delta}
          icon={ShieldAlert}
          color="amber"
          onClick={() => navigate('/dashboard/risk')}
        />
        <KpiCard
          title="People At Risk"
          value={kpis.peopleAtRisk.value}
          delta={kpis.peopleAtRisk.delta}
          icon={Users}
          color="purple"
          onClick={() => navigate('/dashboard/risk')}
        />
        <KpiCard
          title="Evac Progress"
          value={kpis.evacuationProgress.value}
          icon={Compass}
          color="blue"
          onClick={() => navigate('/dashboard/evacuation')}
        />
        <KpiCard
          title="Shelter Capacity"
          value={kpis.shelterCapacity.value}
          icon={Home}
          color="emerald"
          onClick={() => navigate('/dashboard/shelters')}
        />
        <KpiCard
          title="Critical Incidents"
          value={kpis.criticalIncidents.value}
          delta={kpis.criticalIncidents.delta}
          icon={Activity}
          color="red"
          onClick={() => navigate('/dashboard/incidents')}
        />
        <KpiCard
          title="Relief Stock"
          value={kpis.reliefStockStatus.value}
          status={kpis.reliefStockStatus.status}
          icon={Truck}
          color="emerald"
          onClick={() => navigate('/dashboard/relief')}
        />
      </div>

      {/* Main Command Center Layout: Central Map + Telemetry Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Central Map taking 2 Columns */}
        <div className="lg:col-span-2 h-[550px]">
          <CommandMap
            cyclones={cyclones}
            riskZones={riskZones}
            shelters={shelters}
            incidents={incidents}
            responseTeams={responseTeams}
            evacuationPlans={evacuationPlans}
            centerCoords={[13.0827, 80.2707]}
            zoom={9}
            onShelterSelect={(shl) => navigate('/dashboard/shelters')}
          />
        </div>

        {/* Right Sidebar: Active Cyclone Radar & Live Incidents Feed */}
        <div className="space-y-6">
          <CycloneInfoPanel
            cyclone={primaryCyclone}
            onTrackClick={() => navigate('/dashboard/cyclones')}
          />

          {/* Quick Incident Triage Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                  Live Emergency Incidents
                </h4>
              </div>
              <button
                onClick={() => navigate('/dashboard/incidents')}
                className="text-[11px] font-semibold text-cyan-400 hover:underline"
              >
                View Board ({incidents.length})
              </button>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto">
              {incidents.slice(0, 4).map((inc) => (
                <div
                  key={inc._id}
                  onClick={() => navigate('/dashboard/incidents')}
                  className="group cursor-pointer rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-rose-400">{inc.incidentId}</span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300">
                      {inc.severity}
                    </span>
                  </div>
                  <h5 className="mt-1 text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-cyan-300">
                    {inc.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{inc.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
