import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { AlertTriangle, Plus, CheckCircle2, Clock, MapPin, User, Phone, LifeBuoy } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const IncidentBoard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const { lastUpdated } = useSocket();

  // Only operational command personnel can change incident lifecycle or dispatch
  const canManageIncidents = ['admin', 'officer', 'responder', 'coordinator'].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, [lastUpdated, statusFilter, severityFilter]);

  const fetchData = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const [incRes, tmRes] = await Promise.all([
        axios.get('/api/incidents', { params }),
        axios.get('/api/response-teams?status=AVAILABLE')
      ]);
      if (incRes.data.success) setIncidents(incRes.data.data);
      if (tmRes.data.success) setTeams(tmRes.data.data);
    } catch (err) {
      console.error('[Incident Board Error]:', err);
    }
  };

  const handleAssignTeam = async () => {
    if (!assignModal || !selectedTeamId) return;
    setDispatching(true);
    try {
      await axios.post(`/api/incidents/${assignModal._id}/assign`, {
        teamId: selectedTeamId
      });
      setAssignModal(null);
      setSelectedTeamId('');
      await fetchData();
    } catch (err) {
      console.error('[Assign Error]:', err);
    } finally {
      setDispatching(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await axios.put(`/api/incidents/${incidentId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('[Status Update Error]:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Emergency Incident Management & Tactical Triage
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Threat-to-life prioritization, automated response team dispatch, and rescue verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="REPORTED">REPORTED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {incidents.map((inc) => (
          <div
            key={inc._id}
            className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl transition hover:border-slate-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-400">{inc.incidentId}</span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase font-mono">
                    {inc.severity} (Score: {inc.priorityScore})
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  inc.status === 'REPORTED' ? 'bg-amber-500/20 text-amber-300' :
                  inc.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-300' :
                  inc.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {inc.status}
                </span>
              </div>

              <h4 className="mt-3 font-bold text-white text-sm">{inc.title}</h4>
              <p className="mt-1 text-xs text-slate-300 line-clamp-2">{inc.description}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                <div>Type: <strong className="text-slate-200">{inc.emergencyType}</strong></div>
                <div>Victims: <strong className="text-rose-400">{inc.victimCount} People</strong></div>
                <div className="col-span-2 truncate flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{inc.address}, {inc.district}</span>
                </div>
              </div>

              {inc.assignedTeam && (
                <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 text-xs text-blue-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="h-4 w-4 text-blue-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase text-blue-400/80 block">Dispatched Unit</span>
                      <strong className="font-semibold text-white">{inc.assignedTeam.name}</strong>
                    </div>
                  </div>
                  <span className="font-mono text-[10px]">{inc.assignedTeam.status}</span>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              {!inc.assignedTeam && inc.status !== 'RESOLVED' ? (
                canManageIncidents ? (
                  <button
                    onClick={() => setAssignModal(inc)}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition uppercase"
                  >
                    Assign Response Team
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-400 font-mono">Pending Team Dispatch</span>
                )
              ) : (
                <div className="text-[11px] text-slate-400 font-mono">Team Assigned & Active</div>
              )}

              {canManageIncidents ? (
                <div className="flex items-center gap-1.5">
                  {inc.status !== 'IN_PROGRESS' && inc.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusChange(inc._id, 'IN_PROGRESS')}
                      className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[11px] text-purple-300 hover:bg-purple-500/20"
                    >
                      Set In-Progress
                    </button>
                  )}
                  {inc.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusChange(inc._id, 'RESOLVED')}
                      className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/20"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded bg-slate-800/80 px-2.5 py-1 text-[11px] font-mono text-slate-400 border border-slate-700/50">
                  Status: <span className="text-white font-semibold">{inc.status}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#131D31] p-5 shadow-2xl light-adapt-box">
            <h4 className="font-bold text-white text-sm uppercase font-mono">
              Dispatch Response Team: {assignModal.incidentId}
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Select available response unit for immediate deployment.
            </p>

            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
              {teams.length === 0 ? (
                <p className="text-xs text-rose-400 p-2">No response teams currently available in region!</p>
              ) : (
                teams.map((t) => (
                  <label
                    key={t._id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs transition ${
                      selectedTeamId === t._id
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                        : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <strong className="block text-white">{t.name}</strong>
                      <span className="text-[10px] text-slate-400">{t.type} • {t.membersCount} Members</span>
                    </div>
                    <input
                      type="radio"
                      name="teamRadio"
                      value={t._id}
                      checked={selectedTeamId === t._id}
                      onChange={() => setSelectedTeamId(t._id)}
                      className="text-cyan-500"
                    />
                  </label>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setAssignModal(null)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeam}
                disabled={!selectedTeamId || dispatching}
                className="rounded-lg bg-cyan-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition disabled:opacity-50"
              >
                {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default IncidentBoard;
