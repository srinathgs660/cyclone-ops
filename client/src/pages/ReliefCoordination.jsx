import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Truck, Package, AlertCircle, TrendingDown, Send, CheckCircle2, Warehouse, Plus, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ReliefCoordination = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [inventories, setInventories] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [teams, setTeams] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Modal States
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showConvoyModal, setShowConvoyModal] = useState(false);
  const [submittingStock, setSubmittingStock] = useState(false);
  const [submittingConvoy, setSubmittingConvoy] = useState(false);

  const [newStock, setNewStock] = useState({
    warehouseName: 'Central Logistics Hub',
    district: 'Chennai',
    itemType: 'Food Kits',
    totalStock: 5000,
    unit: 'Kits',
    minThreshold: 1000
  });

  const [newConvoy, setNewConvoy] = useState({
    itemType: 'Food Kits',
    quantity: 1000,
    unit: 'Kits',
    warehouseName: 'Central Logistics Hub',
    destinationName: '',
    priority: 'HIGH',
    assignedTeam: ''
  });

  const { lastUpdated } = useSocket();

  useEffect(() => {
    fetchReliefData();
    if (isAdmin) {
      fetchAdminOptions();
    }
  }, [lastUpdated, isAdmin]);

  const fetchReliefData = async () => {
    try {
      const [invRes, dispRes, recRes] = await Promise.all([
        axios.get('/api/relief/inventory'),
        axios.get('/api/relief/distributions'),
        axios.get('/api/relief/recommendations')
      ]);
      if (invRes.data.success) setInventories(invRes.data.data);
      if (dispRes.data.success) setDistributions(dispRes.data.data);
      if (recRes.data.success) setRecommendations(recRes.data.data);
    } catch (err) {
      console.error('[Relief Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminOptions = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        axios.get('/api/response-teams?status=AVAILABLE'),
        axios.get('/api/shelters')
      ]);
      if (tRes.data.success) setTeams(tRes.data.data);
      if (sRes.data.success) setShelters(sRes.data.data);
    } catch (err) {
      console.error('[Relief Options Error]:', err);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setSubmittingStock(true);
    try {
      await axios.post('/api/relief/inventory', newStock);
      setShowAddStockModal(false);
      await fetchReliefData();
    } catch (err) {
      console.error('[Add Stock Error]:', err);
    } finally {
      setSubmittingStock(false);
    }
  };

  const handleCreateConvoy = async (e) => {
    e.preventDefault();
    if (!newConvoy.destinationName) return;
    setSubmittingConvoy(true);
    try {
      await axios.post('/api/relief/distributions', newConvoy);
      setShowConvoyModal(false);
      await fetchReliefData();
    } catch (err) {
      console.error('[Dispatch Convoy Error]:', err);
    } finally {
      setSubmittingConvoy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              Relief Inventory, Warehouse Depots & Distribution Optimization
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Automated shortage detection, algorithmic daily ration calculation, and supply convoy tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs font-mono mr-2">
            <span className="text-slate-400">Shortage Items:</span>
            <strong className="text-rose-400">{inventories.filter(i => i.status === 'LOW' || i.status === 'CRITICAL').length}</strong>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddStockModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-400 bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:brightness-110 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Stock</span>
              </button>
              <button
                onClick={() => setShowConvoyModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md hover:brightness-110 transition"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Dispatch Convoy</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Add Inventory Stock Modal */}
      {showAddStockModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl light-adapt-box">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Register Depot Supplies (Admin)
                </h3>
              </div>
              <button onClick={() => setShowAddStockModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Resource Category *</label>
                <select
                  value={newStock.itemType}
                  onChange={(e) => {
                    const type = e.target.value;
                    let unit = 'Kits';
                    if (type === 'Drinking Water') unit = 'Liters';
                    if (type === 'Blankets') unit = 'Units';
                    if (type === 'Fuel (Diesel/Petrol)') unit = 'Liters';
                    setNewStock({ ...newStock, itemType: type, unit });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value="Food Kits">Food Kits</option>
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Medical Kits">Medical Kits</option>
                  <option value="Blankets">Blankets</option>
                  <option value="Emergency Tents">Emergency Tents</option>
                  <option value="Fuel (Diesel/Petrol)">Fuel (Diesel/Petrol)</option>
                  <option value="Clothing & Hygiene">Clothing & Hygiene</option>
                  <option value="Satellite Radios">Satellite Radios</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newStock.totalStock}
                    onChange={(e) => setNewStock({ ...newStock, totalStock: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={newStock.unit}
                    onChange={(e) => setNewStock({ ...newStock, unit: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Origin Warehouse</label>
                  <input
                    type="text"
                    required
                    value={newStock.warehouseName}
                    onChange={(e) => setNewStock({ ...newStock, warehouseName: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">District / Hub</label>
                  <input
                    type="text"
                    required
                    value={newStock.district}
                    onChange={(e) => setNewStock({ ...newStock, district: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStock}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 transition uppercase font-mono disabled:opacity-50"
                >
                  {submittingStock ? 'Adding...' : 'Store Inventory Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Admin Dispatch Relief Delivery Convoy Modal */}
      {showConvoyModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl light-adapt-box">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Dispatch Relief Supply Convoy (Admin)
                </h3>
              </div>
              <button onClick={() => setShowConvoyModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConvoy} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Resource to Deliver *</label>
                <select
                  value={newConvoy.itemType}
                  onChange={(e) => {
                    const type = e.target.value;
                    let unit = 'Kits';
                    if (type === 'Drinking Water') unit = 'Liters';
                    if (type === 'Blankets') unit = 'Units';
                    if (type === 'Fuel (Diesel/Petrol)') unit = 'Liters';
                    setNewConvoy({ ...newConvoy, itemType: type, unit });
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="Food Kits">Food Kits</option>
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Medical Kits">Medical Kits</option>
                  <option value="Blankets">Blankets</option>
                  <option value="Emergency Tents">Emergency Tents</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newConvoy.quantity}
                    onChange={(e) => setNewConvoy({ ...newConvoy, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Priority Level</label>
                  <select
                    value={newConvoy.priority}
                    onChange={(e) => setNewConvoy({ ...newConvoy, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Destination Facility / Shelter / Zone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marina Beach Relief Shelter #2"
                  value={newConvoy.destinationName}
                  onChange={(e) => setNewConvoy({ ...newConvoy, destinationName: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Assign Response Delivery Unit (Optional)
                </label>
                <select
                  value={newConvoy.assignedTeam}
                  onChange={(e) => setNewConvoy({ ...newConvoy, assignedTeam: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value="">-- Auto-Assign Nearest Transport Team --</option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConvoyModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingConvoy}
                  className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 transition uppercase font-mono disabled:opacity-50"
                >
                  {submittingConvoy ? 'Dispatching...' : 'Deploy Convoy'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Algorithmic Demand & Optimization Card */}
      {recommendations && (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#131D31] via-[#162544] to-[#131D31] p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                AI Resource Optimization Engine Recommendations
              </h4>
            </div>
            <span className="text-xs font-mono text-cyan-300">
              Estimated Beneficiaries: <strong>{recommendations.totalBeneficiaries?.toLocaleString()} Citizens</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono mb-4">
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400">Daily Water Demand</span>
              <p className="mt-1 text-base font-bold text-cyan-300">
                {(recommendations.dailyDemands?.waterLiters || 0).toLocaleString()} <span className="text-xs font-normal">Liters</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400">Daily Food Kits</span>
              <p className="mt-1 text-base font-bold text-amber-300">
                {(recommendations.dailyDemands?.foodKits || 0).toLocaleString()} <span className="text-xs font-normal">Kits</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400">Medical Kits Needed</span>
              <p className="mt-1 text-base font-bold text-rose-300">
                {(recommendations.dailyDemands?.medicalKits || 0).toLocaleString()} <span className="text-xs font-normal">Kits</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-slate-400">Blankets Needed</span>
              <p className="mt-1 text-base font-bold text-purple-300">
                {(recommendations.dailyDemands?.blankets || 0).toLocaleString()} <span className="text-xs font-normal">Units</span>
              </p>
            </div>
          </div>

          {/* Allocation Recommendations List */}
          <div className="space-y-2">
            {(recommendations.recommendations || []).map((rec, rIdx) => (
              <div key={rIdx} className="flex flex-wrap items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs">
                <div>
                  <strong className="text-white font-mono">{rec.zoneName}</strong>
                  <p className="text-[11px] text-slate-400">{rec.rationale}</p>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-cyan-300">💧 {rec.requirements?.waterLiters?.toLocaleString()} L</span>
                  <span className="text-amber-300">🍞 {rec.requirements?.foodKits?.toLocaleString()} Kits</span>
                  <span className="text-rose-400">💊 {rec.requirements?.medicalKits?.toLocaleString()} Med</span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                    {rec.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Inventory Stock Status */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono mb-3">
          Depot Stock Reserves & Inventory Health
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {inventories.map((inv) => (
            <div
              key={inv._id}
              className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">{inv.warehouseName}</span>
                  <h5 className="font-bold text-white text-sm mt-0.5">{inv.itemType}</h5>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  inv.status === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  inv.status === 'LOW' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {inv.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Available Stock:</span>
                  <strong className="text-white">{inv.availableStock?.toLocaleString()} {inv.unit}</strong>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
                  <div
                    className={`h-full ${
                      inv.status === 'NORMAL' ? 'bg-emerald-400' :
                      inv.status === 'LOW' ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (inv.availableStock / inv.totalStock) * 100)}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Reserved: {inv.reservedStock}</span>
                  <span>Min Threshold: {inv.minThreshold}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Relief Convoys Table */}
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
            Active Relief Distribution Convoys
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase">
              <tr>
                <th className="p-3">Convoy ID</th>
                <th className="p-3">Cargo Resource</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Origin Depot</th>
                <th className="p-3">Destination Facility</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {distributions.map((d) => (
                <tr key={d._id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-cyan-300">{d.distributionId}</td>
                  <td className="p-3 font-semibold text-white">{d.itemType}</td>
                  <td className="p-3">{d.quantity?.toLocaleString()} {d.unit}</td>
                  <td className="p-3 text-slate-400">{d.warehouseName}</td>
                  <td className="p-3 text-slate-200">{d.destinationName}</td>
                  <td className="p-3">
                    <span className="font-bold text-rose-400">{d.priority}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      d.deliveryStatus === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-300' :
                      d.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {d.deliveryStatus}
                    </span>
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

export default ReliefCoordination;
