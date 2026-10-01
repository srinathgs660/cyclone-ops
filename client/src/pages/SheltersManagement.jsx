import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Home, Search, Filter, Check, X, Phone, UserCheck, AlertCircle, Plus } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const SheltersManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [shelters, setShelters] = useState([]);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newShelter, setNewShelter] = useState({
    name: '',
    address: '',
    district: 'Chennai',
    totalCapacity: 1200,
    lat: 13.08,
    lng: 80.27,
    contactPerson: 'EOC Facility Officer',
    contactPhone: '+91 98765 43210',
    drinkingWater: true,
    foodSupplies: true,
    medicalSupport: true,
    electricity: true,
    backupGenerators: true
  });
  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchShelters();
  }, [lastUpdated, districtFilter, statusFilter]);

  const fetchShelters = async () => {
    try {
      const params = {};
      if (districtFilter) params.district = districtFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('/api/shelters', { params });
      if (res.data.success) {
        setShelters(res.data.data);
      }
    } catch (err) {
      console.error('[Shelters Error]:', err);
    }
  };

  const handleRegisterShelter = async (e) => {
    e.preventDefault();
    if (!newShelter.name || !newShelter.address) return;
    setCreating(true);
    try {
      await axios.post('/api/shelters', {
        name: newShelter.name,
        address: newShelter.address,
        district: newShelter.district,
        totalCapacity: Number(newShelter.totalCapacity),
        coordinates: [Number(newShelter.lng), Number(newShelter.lat)],
        contactPerson: newShelter.contactPerson,
        contactPhone: newShelter.contactPhone,
        facilities: {
          drinkingWater: newShelter.drinkingWater,
          foodSupplies: newShelter.foodSupplies,
          medicalSupport: newShelter.medicalSupport,
          electricity: newShelter.electricity,
          backupGenerators: newShelter.backupGenerators,
          toilets: true,
          womenChildrenSupport: true,
          accessibilityRamps: true
        }
      });
      setShowCreateModal(false);
      setNewShelter({
        name: '',
        address: '',
        district: 'Chennai',
        totalCapacity: 1200,
        lat: 13.08,
        lng: 80.27,
        contactPerson: 'EOC Facility Officer',
        contactPhone: '+91 98765 43210',
        drinkingWater: true,
        foodSupplies: true,
        medicalSupport: true,
        electricity: true,
        backupGenerators: true
      });
      await fetchShelters();
    } catch (err) {
      console.error('[Register Shelter Error]:', err);
    } finally {
      setCreating(false);
    }
  };

  const filtered = shelters.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  const totalCap = shelters.reduce((acc, s) => acc + (s.totalCapacity || 0), 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + (s.occupied || 0), 0);
  const totalAvail = shelters.reduce((acc, s) => acc + (s.available || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Emergency Shelters Management & Real-Time Capacity
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Monitor shelter occupancy, medical and food support, and prevent overcapacity overflow
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-mono mr-2">
            <div>Total Capacity: <strong className="text-white">{totalCap.toLocaleString()}</strong></div>
            <div>Occupied: <strong className="text-amber-300">{totalOccupied.toLocaleString()}</strong></div>
            <div>Available: <strong className="text-emerald-400">{totalAvail.toLocaleString()}</strong></div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:brightness-110 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Shelter</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Register Shelter Modal */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl light-adapt-box">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Register Emergency Shelter Facility (Admin)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterShelter} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Shelter Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Higher Secondary School Relief Camp"
                  value={newShelter.name}
                  onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Physical Address / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14, Kamarajar Salai, Triplicane, Chennai"
                  value={newShelter.address}
                  onChange={(e) => setNewShelter({ ...newShelter, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    District / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={newShelter.district}
                    onChange={(e) => setNewShelter({ ...newShelter, district: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Total Safe Capacity (Persons) *
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={newShelter.totalCapacity}
                    onChange={(e) => setNewShelter({ ...newShelter, totalCapacity: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    GPS Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newShelter.lat}
                    onChange={(e) => setNewShelter({ ...newShelter, lat: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    GPS Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newShelter.lng}
                    onChange={(e) => setNewShelter({ ...newShelter, lng: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Facility Manager Name
                  </label>
                  <input
                    type="text"
                    value={newShelter.contactPerson}
                    onChange={(e) => setNewShelter({ ...newShelter, contactPerson: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                    Emergency Hotline
                  </label>
                  <input
                    type="text"
                    value={newShelter.contactPhone}
                    onChange={(e) => setNewShelter({ ...newShelter, contactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1.5">
                  Verified Facilities Present:
                </label>
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShelter.drinkingWater}
                      onChange={(e) => setNewShelter({ ...newShelter, drinkingWater: e.target.checked })}
                    />
                    Drinking Water
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShelter.foodSupplies}
                      onChange={(e) => setNewShelter({ ...newShelter, foodSupplies: e.target.checked })}
                    />
                    Food Stock
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShelter.medicalSupport}
                      onChange={(e) => setNewShelter({ ...newShelter, medicalSupport: e.target.checked })}
                    />
                    Medical Post
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShelter.backupGenerators}
                      onChange={(e) => setNewShelter({ ...newShelter, backupGenerators: e.target.checked })}
                    />
                    Power Generator
                  </label>
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
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 transition uppercase font-mono disabled:opacity-50"
                >
                  {creating ? 'Registering...' : 'Register Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#131D31] p-3 shadow-lg">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search shelters by name, code or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Districts</option>
            <option value="Chennai">Chennai</option>
            <option value="Thiruvallur">Thiruvallur</option>
            <option value="Chengalpattu">Chengalpattu</option>
            <option value="Cuddalore">Cuddalore</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="FILLING">FILLING</option>
            <option value="FULL">FULL</option>
          </select>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div
            key={s._id}
            className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl transition hover:border-slate-700"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{s.code}</span>
                <h4 className="font-bold text-white text-sm line-clamp-1">{s.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{s.district}, {s.state}</p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                s.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                s.status === 'FILLING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {s.status}
              </span>
            </div>

            {/* Occupancy Gauge */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Occupancy:</span>
                <strong>{s.occupied} / {s.totalCapacity} ({s.occupancyPercent}%)</strong>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                <div
                  className={`h-full transition-all ${
                    s.occupancyPercent >= 90 ? 'bg-rose-500' :
                    s.occupancyPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${s.occupancyPercent}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400">Available: {s.available} slots</span>
                <span className="text-slate-500">Max: {s.totalCapacity}</span>
              </div>
            </div>

            {/* Facilities checklist */}
            <div className="mt-4 border-t border-slate-800/80 pt-3">
              <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">Verified Amenities</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                <span className="flex items-center gap-1">
                  {s.facilities?.drinkingWater ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />} Drinking Water
                </span>
                <span className="flex items-center gap-1">
                  {s.facilities?.foodSupplies ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />} Cooked Food
                </span>
                <span className="flex items-center gap-1">
                  {s.facilities?.medicalSupport ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />} Medical Bay
                </span>
                <span className="flex items-center gap-1">
                  {s.facilities?.backupGenerators ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />} Gen Backup
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <UserCheck className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{s.contactPerson}</span>
              </div>
              <a
                href={`tel:${s.contactPhone}`}
                className="flex items-center gap-1 text-cyan-400 hover:underline font-mono text-[11px]"
              >
                <Phone className="h-3 w-3" />
                {s.contactPhone}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SheltersManagement;
