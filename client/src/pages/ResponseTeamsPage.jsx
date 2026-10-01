import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { LifeBuoy, MapPin, Users, Truck, Wrench, Shield, CheckCircle, Clock, Plus, X, UserCheck } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ResponseTeamsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [teams, setTeams] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    type: 'Search & Rescue',
    leaderName: '',
    contactPhone: '+91 98401 22334',
    vehicleType: 'High-Clearance Rescue Truck',
    vehiclePlate: 'TN-01-DM-4501'
  });
  const { lastUpdated } = useSocket();

  // Roles permitted to command and dispatch field units
  const canDispatch = ['admin', 'officer', 'responder', 'coordinator'].includes(user?.role);

  useEffect(() => {
    fetchTeams();
    if (isAdmin) {
      fetchVolunteers();
    }
  }, [lastUpdated, typeFilter, statusFilter, isAdmin]);

  const fetchTeams = async () => {
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('/api/response-teams', { params });
      if (res.data.success) {
        setTeams(res.data.data);
      }
    } catch (err) {
      console.error('[Response Teams Error]:', err);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await axios.get('/api/response-teams/volunteers/list');
      if (res.data.success) {
        setVolunteers(res.data.data);
      }
    } catch (err) {
      console.error('[Volunteers Fetch Error]:', err);
    }
  };

  const handleToggleStatus = async (teamId, currentStatus) => {
    if (!canDispatch) return;
    const nextStatus = currentStatus === 'AVAILABLE' ? 'DISPATCHED' : 'AVAILABLE';
    setActionLoading(prev => ({ ...prev, [teamId]: true }));
    try {
      await axios.put(`/api/response-teams/${teamId}/status`, { status: nextStatus });
      await fetchTeams();
    } catch (err) {
      console.error('[Status Toggle Error]:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [teamId]: false }));
    }
  };

  const toggleVolunteerSelect = (vId) => {
    setSelectedVolunteers(prev =>
      prev.includes(vId) ? prev.filter(id => id !== vId) : [...prev, vId]
    );
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.leaderName) return;
    setCreating(true);
    try {
      await axios.post('/api/response-teams', {
        name: newTeam.name,
        type: newTeam.type,
        leaderName: newTeam.leaderName,
        contactPhone: newTeam.contactPhone,
        volunteerMembers: selectedVolunteers,
        vehicle: {
          type: newTeam.vehicleType,
          plateNumber: newTeam.vehiclePlate,
          capacity: selectedVolunteers.length + 2
        }
      });
      setShowCreateModal(false);
      setNewTeam({
        name: '',
        type: 'Search & Rescue',
        leaderName: '',
        contactPhone: '+91 98401 22334',
        vehicleType: 'High-Clearance Rescue Truck',
        vehiclePlate: 'TN-01-DM-4501'
      });
      setSelectedVolunteers([]);
      await fetchTeams();
    } catch (err) {
      console.error('[Create Team Error]:', err);
    } finally {
      setCreating(false);
    }
  };

  const availableCount = teams.filter(t => t.status === 'AVAILABLE').length;
  const dispatchedCount = teams.filter(t => t.status === 'DISPATCHED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Emergency Response Teams & Tactical Field Units
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {canDispatch
              ? 'Authorized command & control: Dispatch specialized units and monitor field readiness'
              : 'Public Citizen View: Real-time response team presence and deployment status (Read-Only)'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-mono mr-2">
            <div>Total Units: <strong className="text-white">{teams.length}</strong></div>
            <div>Available: <strong className="text-emerald-400">{availableCount}</strong></div>
            <div>Dispatched / On Scene: <strong className="text-amber-300">{dispatchedCount}</strong></div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-blue-400 bg-gradient-to-r from-blue-500 to-indigo-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Response Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Create Response Team Modal */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl light-adapt-box max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Establish New Response Unit (Admin)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NDRF Coastal Flood Taskforce Delta"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Specialty / Type *
                  </label>
                  <select
                    value={newTeam.type}
                    onChange={(e) => setNewTeam({ ...newTeam, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-400 font-mono"
                  >
                    <option value="Search & Rescue">Search & Rescue</option>
                    <option value="Medical Response">Medical Response</option>
                    <option value="Fire & Rescue">Fire & Rescue</option>
                    <option value="Engineering & Debris">Engineering & Debris</option>
                    <option value="Law Enforcement">Law Enforcement</option>
                    <option value="Logistics & Supply">Logistics & Supply</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Team Commander Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspector K. Velumani"
                    value={newTeam.leaderName}
                    onChange={(e) => setNewTeam({ ...newTeam, leaderName: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeam.contactPhone}
                    onChange={(e) => setNewTeam({ ...newTeam, contactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Assigned Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={newTeam.vehicleType}
                    onChange={(e) => setNewTeam({ ...newTeam, vehicleType: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              {/* Volunteer Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono uppercase text-slate-300">
                    Draft Community Volunteers into this Unit ({selectedVolunteers.length} Selected)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Available: {volunteers.length}</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-slate-700 bg-slate-900/80 p-2">
                  {volunteers.map((v) => {
                    const isSelected = selectedVolunteers.includes(v._id);
                    return (
                      <div
                        key={v._id}
                        onClick={() => toggleVolunteerSelect(v._id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition ${
                          isSelected ? 'bg-blue-600/30 border border-blue-500/50 text-white' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded"
                          />
                          <div>
                            <span className="font-semibold block">{v.name}</span>
                            <span className="text-[10px] text-slate-400">{v.skills || v.phone}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-cyan-400 font-mono">Ready</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 transition uppercase font-mono disabled:opacity-50 shadow"
                >
                  {creating ? 'Commissioning...' : 'Commission Response Team'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#131D31] p-3 shadow-lg">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Specialties</option>
          <option value="Search & Rescue">Search & Rescue</option>
          <option value="Medical Response">Medical Response</option>
          <option value="Fire & Rescue">Fire & Rescue</option>
          <option value="Engineering & Debris">Engineering & Debris</option>
          <option value="Law Enforcement">Law Enforcement</option>
          <option value="Logistics & Supply">Logistics & Supply</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="ON_SCENE">ON_SCENE</option>
        </select>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((t) => (
          <div
            key={t._id}
            className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl transition hover:border-slate-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{t.teamId}</span>
                  <h4 className="font-bold text-white text-sm line-clamp-1">{t.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.type}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  t.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  t.status === 'DISPATCHED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Team Leader:</span>
                  <strong className="text-white">{t.leaderName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Crew:</span>
                  <strong>{t.membersCount} Operators</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <strong className="text-cyan-300">{t.contactPhone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <strong className="text-slate-200 truncate max-w-[170px]">{t.vehicle?.type}</strong>
                </div>
              </div>

              {/* Equipment Tags */}
              <div className="mt-4 border-t border-slate-800/80 pt-3">
                <p className="text-[10px] uppercase font-mono text-slate-400 mb-1.5">Assigned Gear</p>
                <div className="flex flex-wrap gap-1.5">
                  {(t.equipment || []).map((eq, eIdx) => (
                    <span key={eIdx} className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3">
              {canDispatch ? (
                <button
                  onClick={() => handleToggleStatus(t._id, t.status)}
                  disabled={actionLoading[t._id]}
                  className={`w-full rounded py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    actionLoading[t._id] ? 'opacity-50 cursor-wait' : ''
                  } ${
                    t.status === 'AVAILABLE'
                      ? 'border border-blue-500/40 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                      : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {actionLoading[t._id]
                    ? 'Updating...'
                    : t.status === 'AVAILABLE'
                    ? 'Dispatch Unit'
                    : 'Mark Available'}
                </button>
              ) : (
                <div className="flex items-center justify-between rounded bg-slate-800/60 px-3 py-1.5 text-[11px] font-mono text-slate-400 border border-slate-700/50">
                  <span>Deployment Control:</span>
                  <span className="text-cyan-400 font-semibold">Authorized Ops Only</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponseTeamsPage;
