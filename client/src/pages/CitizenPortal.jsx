import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertOctagon, MapPin, ShieldAlert, Navigation, Bell, PhoneCall, Send, CheckCircle2, Home } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const CitizenPortal = () => {
  const [activeTab, setActiveTab] = useState('home'); // home, sos, risk, shelters, contacts
  const [userCoords, setUserCoords] = useState([80.2707, 13.0827]); // Default Chennai
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [nearestShelters, setNearestShelters] = useState([]);
  const [sosSent, setSosSent] = useState(false);
  const [sendingSos, setSendingSos] = useState(false);
  const { liveAlerts } = useSocket();

  const [sosForm, setSosForm] = useState({
    fullName: '',
    contactPhone: '',
    emergencyType: 'Trapped Civilians',
    peopleCount: 1,
    address: 'Marina Lowlands Beach Sector',
    description: ''
  });

  useEffect(() => {
    // Attempt HTML5 geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setUserCoords(coords);
          evaluateRisk(coords);
          fetchNearbyShelters(coords);
        },
        () => {
          evaluateRisk(userCoords);
          fetchNearbyShelters(userCoords);
        }
      );
    } else {
      evaluateRisk(userCoords);
      fetchNearbyShelters(userCoords);
    }
  }, []);

  const evaluateRisk = async (coords) => {
    try {
      const res = await axios.get(`/api/citizen/risk-check?lng=${coords[0]}&lat=${coords[1]}`);
      if (res.data.success) {
        setRiskAssessment(res.data);
      }
    } catch (err) {
      console.error('[Citizen Risk Check Error]:', err);
    }
  };

  const fetchNearbyShelters = async (coords) => {
    try {
      const res = await axios.get(`/api/shelters/nearby?lng=${coords[0]}&lat=${coords[1]}&limit=3`);
      if (res.data.success) {
        setNearestShelters(res.data.data);
      }
    } catch (err) {
      console.error('[Nearby Shelters Error]:', err);
    }
  };

  const handleSendSos = async (e) => {
    e.preventDefault();
    setSendingSos(true);
    try {
      const payload = {
        ...sosForm,
        coordinates: userCoords
      };
      const res = await axios.post('/api/citizen/sos', payload);
      if (res.data.success) {
        setSosSent(res.data);
      }
    } catch (err) {
      console.error('[SOS Send Error]:', err);
    } finally {
      setSendingSos(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Citizen Header */}
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-900 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl p-1 bg-slate-900 border border-rose-500/40 shadow-xl">
          <img src="/logo.png" alt="Cyclone Emergency Logo" className="h-full w-full object-contain rounded-xl" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 font-mono border border-rose-500/40 animate-pulse">
          🚨 CITIZEN EMERGENCY PORTAL
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white uppercase font-mono">
          Cyclone Emergency Assistance
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Immediate life-safety rescue, real-time localized threat level, and verified shelter navigation.
        </p>

        {/* Current Risk Snapshot */}
        {riskAssessment && (
          <div className="mt-4 inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-xs font-mono">
            <span className="text-slate-400">Your Local Threat:</span>
            <span className={`font-black uppercase px-2 py-0.5 rounded ${
              riskAssessment.riskLevel === 'CRITICAL' ? 'bg-rose-500 text-slate-950' :
              riskAssessment.riskLevel === 'HIGH' ? 'bg-orange-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              {riskAssessment.riskLevel}
            </span>
            <span className="text-slate-400">• Cyclone Eye: <strong>{riskAssessment.cycloneDistanceKm} km</strong></span>
          </div>
        )}
      </div>

      {/* Touch-Friendly Action Navigation Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button
          onClick={() => setActiveTab('sos')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
            activeTab === 'sos'
              ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-950/50'
              : 'border-slate-800 bg-[#131D31] text-slate-200 hover:border-rose-500/40'
          }`}
        >
          <AlertOctagon className="h-7 w-7 text-rose-400 mb-1.5 animate-bounce" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">1. SEND SOS</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
            activeTab === 'shelters'
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-950/50'
              : 'border-slate-800 bg-[#131D31] text-slate-200 hover:border-emerald-500/40'
          }`}
        >
          <Home className="h-7 w-7 text-emerald-400 mb-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">2. FIND SHELTER</span>
        </button>

        <button
          onClick={() => setActiveTab('risk')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
            activeTab === 'risk'
              ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-950/50'
              : 'border-slate-800 bg-[#131D31] text-slate-200 hover:border-amber-500/40'
          }`}
        >
          <ShieldAlert className="h-7 w-7 text-amber-400 mb-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">3. MY RISK</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
            activeTab === 'alerts'
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-950/50'
              : 'border-slate-800 bg-[#131D31] text-slate-200 hover:border-cyan-500/40'
          }`}
        >
          <Bell className="h-7 w-7 text-cyan-400 mb-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">4. ALERTS</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all col-span-2 sm:col-span-2 ${
            activeTab === 'contacts'
              ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-950/50'
              : 'border-slate-800 bg-[#131D31] text-slate-200 hover:border-blue-500/40'
          }`}
        >
          <PhoneCall className="h-7 w-7 text-blue-400 mb-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">5. EMERGENCY HELPLINES</span>
        </button>
      </div>

      {/* TAB CONTENT: SOS FORM */}
      {activeTab === 'sos' && (
        <div className="rounded-2xl border border-rose-500/50 bg-[#131D31] p-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
            <AlertOctagon className="h-6 w-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono">Emergency SOS Distress Broadcast</h3>
              <p className="text-xs text-slate-400">Directly alerts the central EOC and dispatches the nearest rescue boat/team.</p>
            </div>
          </div>

          {sosSent ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-lg font-bold text-white font-mono uppercase">SOS Dispatched & Triaged!</h4>
              <p className="mt-1 text-xs text-emerald-300">{sosSent.message}</p>
              <div className="mt-4 rounded-lg bg-slate-900 p-3 text-xs font-mono text-left space-y-1">
                <div>Incident ID: <strong className="text-cyan-300">{sosSent.incidentId}</strong></div>
                <div>Assigned Unit: <strong className="text-emerald-400">{sosSent.assignedTeam}</strong></div>
                <div>Status: <span className="text-amber-400 font-bold">RESCUE TEAM DISPATCHED</span></div>
              </div>
              <button
                onClick={() => setSosSent(false)}
                className="mt-4 text-xs font-bold text-cyan-400 underline"
              >
                Send Another Emergency Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSos} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sundaram"
                    value={sosForm.fullName}
                    onChange={(e) => setSosForm({ ...sosForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98401 23456"
                    value={sosForm.contactPhone}
                    onChange={(e) => setSosForm({ ...sosForm, contactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Emergency Nature</label>
                  <select
                    value={sosForm.emergencyType}
                    onChange={(e) => setSosForm({ ...sosForm, emergencyType: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Trapped Civilians">Trapped Civilians (Rising Waters / Roof)</option>
                    <option value="Medical Emergency">Critical Medical Emergency</option>
                    <option value="Severe Flooding">Rapid Ground Flooding</option>
                    <option value="Building Collapse / Structural Risk">Building Damage / Wall Collapse</option>
                    <option value="Missing Person">Missing Person</option>
                    <option value="Food/Water Crisis">Infant Food / Drinking Water Crisis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Number of People Trapped / Affected</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={sosForm.peopleCount}
                    onChange={(e) => setSosForm({ ...sosForm, peopleCount: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Current Physical Location / Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Street, Near Lighthouse, Marina Beach Lowlands"
                  value={sosForm.address}
                  onChange={(e) => setSosForm({ ...sosForm, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Situation Description</label>
                <textarea
                  rows="3"
                  placeholder="Water level height, children/elderly present, roof access, landmarks..."
                  value={sosForm.description}
                  onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingSos}
                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-red-700 py-3 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-rose-950/60 hover:from-rose-500 hover:to-red-600 transition disabled:opacity-50"
              >
                {sendingSos ? 'TRANSMITTING DISTRESS SIGNAL...' : '🚨 TRANSMIT IMMEDIATE SOS DISTRESS CALL'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: NEARBY SHELTERS */}
      {activeTab === 'shelters' && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase font-mono">Closest Verified Emergency Shelters</h3>
            <p className="text-xs text-slate-400">Sorted by live geospatial distance from your detected GPS position.</p>
          </div>

          <div className="space-y-3">
            {nearestShelters.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-white text-sm">{item.shelter.name}</h5>
                    <p className="text-slate-400 mt-0.5">{item.shelter.address}</p>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono font-bold text-emerald-300">
                    {item.distanceKm} KM AWAY
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] font-mono">
                  <span className="text-cyan-300">Available: <strong>{item.shelter.available} slots</strong></span>
                  <span className="text-slate-400">Status: <strong className="text-emerald-400">{item.shelter.status}</strong></span>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${item.shelter.location?.coordinates[1]},${item.shelter.location?.coordinates[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block text-center rounded-lg bg-emerald-500/20 border border-emerald-500/40 py-2 font-bold uppercase text-emerald-300 hover:bg-emerald-500/30 transition"
                >
                  Navigate to this Shelter
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY RISK */}
      {activeTab === 'risk' && riskAssessment && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase font-mono">Personalized Risk Calculation</h3>
            <p className="text-xs text-slate-400">Computed for coordinates {userCoords[1]?.toFixed(3)}°N, {userCoords[0]?.toFixed(3)}°E</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Cyclone:</span>
              <strong className="text-white">{riskAssessment.activeCycloneName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Distance from Eye:</span>
              <strong className="text-amber-300">{riskAssessment.cycloneDistanceKm} km</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Threat Classification:</span>
              <strong className="text-rose-400 uppercase font-black">{riskAssessment.riskLevel}</strong>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
            <h5 className="font-bold text-cyan-300 font-mono text-xs uppercase mb-1">Official Directive:</h5>
            <p className="text-xs text-slate-200">{riskAssessment.recommendation}</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 shadow-2xl space-y-3">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase font-mono">Official Broadcast Alerts</h3>
            <p className="text-xs text-slate-400">Authorized alerts issued by Disaster Operations Center.</p>
          </div>

          {liveAlerts.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">No active red alerts at this moment.</p>
          ) : (
            liveAlerts.map(a => (
              <div key={a.id} className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-rose-400 text-[10px]">{a.severity}</span>
                  <span className="text-slate-500 text-[10px] font-mono">{new Date(a.time).toLocaleTimeString()}</span>
                </div>
                <h5 className="font-bold text-white text-sm">{a.title}</h5>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 shadow-2xl space-y-3">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase font-mono">Emergency 24/7 Helplines</h3>
            <p className="text-xs text-slate-400">Direct toll-free lines to central control rooms.</p>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div>
                <strong className="text-white block">State Disaster Operations Control Room</strong>
                <span className="text-[11px] text-slate-500">Toll Free 24/7 Hotline</span>
              </div>
              <a href="tel:1070" className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 font-bold text-cyan-300">
                1070
              </a>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div>
                <strong className="text-white block">District Disaster Helpline (Chennai)</strong>
                <span className="text-[11px] text-slate-500">Local emergency response</span>
              </div>
              <a href="tel:1077" className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 font-bold text-cyan-300">
                1077
              </a>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div>
                <strong className="text-white block">Police Control Room</strong>
                <span className="text-[11px] text-slate-500">Immediate security & rescue dispatch</span>
              </div>
              <a href="tel:100" className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 font-bold text-cyan-300">
                100
              </a>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div>
                <strong className="text-white block">Fire & Rescue Services</strong>
                <span className="text-[11px] text-slate-500">Flood rescue and hazardous operations</span>
              </div>
              <a href="tel:101" className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 font-bold text-cyan-300">
                101
              </a>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
              <div>
                <strong className="text-white block">Emergency Medical Ambulance</strong>
                <span className="text-[11px] text-slate-500">Trauma ICU ambulance fleet</span>
              </div>
              <a href="tel:108" className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 font-bold text-cyan-300">
                108
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenPortal;
