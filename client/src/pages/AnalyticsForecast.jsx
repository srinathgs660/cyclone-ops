import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, Compass, Clock, Activity, Calendar } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useSocket } from '../context/SocketContext';

const AnalyticsForecast = () => {
  const [chartData, setChartData] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchAnalytics();
  }, [lastUpdated]);

  const fetchAnalytics = async () => {
    try {
      const [chRes, fcRes] = await Promise.all([
        axios.get('/api/analytics/charts'),
        axios.get('/api/analytics/forecasts')
      ]);
      if (chRes.data.success) setChartData(chRes.data.data);
      if (fcRes.data.success) setForecasts(fcRes.data.data);
    } catch (err) {
      console.error('[Analytics Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#06B6D4', '#F43F5E', '#F59E0B', '#10B981', '#8B5CF6', '#3B82F6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Operational Analytics, Readiness Metrics & Multi-Day Baseline Forecasting
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Post-incident performance analysis, resource burnout telemetry, and 24h to 7-day predictive models
          </p>
        </div>
      </div>

      {/* Operational Performance Summary Cards */}
      {chartData?.operationalPerformance && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4 text-center">
            <p className="text-xs uppercase font-mono text-slate-400">Avg Response Time</p>
            <p className="mt-1 text-2xl font-bold font-mono text-cyan-300">{chartData.operationalPerformance.avgResponseTimeMin} <span className="text-xs">min</span></p>
            <span className="text-[10px] text-emerald-400 font-mono">Target: &lt; 25 min</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4 text-center">
            <p className="text-xs uppercase font-mono text-slate-400">Evacuation Rate</p>
            <p className="mt-1 text-2xl font-bold font-mono text-emerald-400">{chartData.operationalPerformance.evacuationCompletion}%</p>
            <span className="text-[10px] text-emerald-400 font-mono">Ahead of Schedule</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4 text-center">
            <p className="text-xs uppercase font-mono text-slate-400">Shelter Utilization</p>
            <p className="mt-1 text-2xl font-bold font-mono text-amber-300">{chartData.operationalPerformance.shelterUtilization}%</p>
            <span className="text-[10px] text-amber-400 font-mono">Optimal Buffer</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4 text-center">
            <p className="text-xs uppercase font-mono text-slate-400">Incident Triage Rate</p>
            <p className="mt-1 text-2xl font-bold font-mono text-purple-300">{chartData.operationalPerformance.incidentResolution}%</p>
            <span className="text-[10px] text-purple-400 font-mono">High Resolution</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31] p-4 text-center">
            <p className="text-xs uppercase font-mono text-slate-400">Relief Dispatch</p>
            <p className="mt-1 text-2xl font-bold font-mono text-blue-300">{chartData.operationalPerformance.reliefDeliveryRate}%</p>
            <span className="text-[10px] text-blue-400 font-mono">Escort On-Time</span>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shelter Occupancy Bar Chart */}
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
            Shelter Capacity Utilization (% Occupied)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData?.shelterOccupancy || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="occupancyPercent" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Types Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
            Categorized Emergency Incidents Distribution
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData?.incidentBreakdown || []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis dataKey="_id" type="category" tick={{ fill: '#94A3B8', fontSize: 10 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#F43F5E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 24h to 7-Day Baseline Forecasting Models */}
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Calendar className="h-4 w-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
            Baseline Predictive Models (24h, 48h, 72h & 7-Day Outlook)
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(forecasts?.timeframes || []).map((tf, idx) => (
            <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <strong className="text-cyan-300 font-bold text-sm">{tf.period}</strong>
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                  {tf.confidence}
                </span>
              </div>
              <div>Projected Wind: <strong className="text-white">{tf.windSpeedKmH} km/h</strong></div>
              <div>Barometric Drop: <strong className="text-amber-300">{tf.pressureHpa} hPa</strong></div>
              <div>Category: <strong className="text-rose-400">{tf.category}</strong></div>
              <div>Est Evacuees: <strong className="text-cyan-300">{tf.evacuationDemandEst?.toLocaleString()}</strong></div>
              <div>Shelter Load: <strong>{tf.shelterOccupancyEstPercent}%</strong></div>
              <div>Rations: {tf.waterDemandLiters?.toLocaleString()} L / {tf.foodKitsDemand?.toLocaleString()} Kits</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsForecast;
