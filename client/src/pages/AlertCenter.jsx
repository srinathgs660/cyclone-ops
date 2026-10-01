import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Send, AlertOctagon, CheckCircle2, Radio, Globe } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('CYCLONE WARNING');
  const [severity, setSeverity] = useState('CRITICAL');
  const [description, setDescription] = useState('');
  const [regions, setRegions] = useState('Chennai, Thiruvallur, Chengalpattu');
  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchAlerts();
  }, [lastUpdated]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/alerts');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('[Alerts Error]:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      await axios.post('/api/alerts', {
        title,
        type,
        severity,
        description,
        affectedRegions: regions.split(',').map(r => r.trim()),
        broadcastChannels: ['SMS', 'APP', 'RADIO', 'SIREN']
      });
      setTitle('');
      setDescription('');
      await fetchAlerts();
    } catch (err) {
      console.error('[Broadcast Error]:', err);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`/api/alerts/${id}/resolve`);
      await fetchAlerts();
    } catch (err) {
      console.error('[Resolve Alert Error]:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Emergency Broadcast Center & Public Notifications
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Issue multi-channel official warning sirens, push alerts, and regional evacuation mandates
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-300">
          Active Broadcasts: <strong>{alerts.length}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Broadcast Form */}
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Radio className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Issue Official Emergency Broadcast
            </h4>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Alert Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. MANDATORY EVACUATION ORDER - COASTAL ZONE A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:outline-none"
                >
                  <option value="CYCLONE WARNING">CYCLONE WARNING</option>
                  <option value="EVACUATION ORDER">EVACUATION ORDER</option>
                  <option value="SHELTER UPDATE">SHELTER UPDATE</option>
                  <option value="ROAD CLOSURE">ROAD CLOSURE</option>
                  <option value="FLOOD WARNING">FLOOD WARNING</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (RED)</option>
                  <option value="WARNING">WARNING (ORANGE)</option>
                  <option value="INFO">INFO (BLUE)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Districts</label>
              <input
                type="text"
                value={regions}
                onChange={(e) => setRegions(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Detailed Public Advisory</label>
              <textarea
                rows="3"
                required
                placeholder="Specific instructions, assembly points, emergency numbers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full rounded-lg bg-rose-600 py-2.5 font-bold uppercase tracking-wider text-white hover:bg-rose-500 transition shadow-lg shadow-rose-950/50 disabled:opacity-50"
            >
              {broadcasting ? 'Transmitting Alert...' : 'Broadcast to All Citizen Channels'}
            </button>
          </form>
        </div>

        {/* Active Broadcasts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Active Real-Time Emergency Broadcasts
          </h4>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div
                key={a._id}
                className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-4 shadow-xl transition"
              >
                <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-rose-400">{a.alertId}</span>
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                      {a.severity}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{a.type}</span>
                  </div>
                  <button
                    onClick={() => handleResolve(a._id)}
                    className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
                  >
                    Deactivate Alert
                  </button>
                </div>

                <h5 className="mt-2 text-sm font-bold text-white">{a.title}</h5>
                <p className="mt-1 text-xs text-slate-300">{a.description}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2 text-[11px] text-slate-400 font-mono">
                  <div>Regions: <strong className="text-slate-300">{(a.affectedRegions || []).join(', ')}</strong></div>
                  <div>Issuer: <strong className="text-cyan-300">{a.issuerName}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;
