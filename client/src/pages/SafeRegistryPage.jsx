import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartHandshake, Search, CheckCircle2, ShieldCheck, MapPin, 
  Phone, Users, PlusCircle, AlertCircle, RefreshCw, X, QrCode
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const SafeRegistryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [stats, setStats] = useState({ totalCheckins: 0, totalPeopleSafe: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State for "I Am Safe"
  const [checkinForm, setCheckinForm] = useState({
    citizenName: '',
    phone: '',
    shelterName: 'Chennai Girls Higher Secondary School Shelter - Triplicane',
    district: 'Chennai Coastal Zone',
    familyMembersCount: 1,
    familyMembersNames: '',
    medicalAssistanceRequired: false,
    notes: 'All safe, dry rations received.'
  });

  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchRecentCheckins();
  }, []);

  // Real-time socket listener for incoming safe check-ins
  useEffect(() => {
    if (!socket) return;
    socket.on('registry:safe_checkin', (data) => {
      setRecentCheckins(prev => [data, ...prev.slice(0, 24)]);
      setStats(prev => ({
        totalCheckins: prev.totalCheckins + 1,
        totalPeopleSafe: prev.totalPeopleSafe + (data.familyMembersCount || 1)
      }));
      showNotification(`Verified Safe Check-in: ${data.citizenName} & family at ${data.shelterName}`);
    });

    return () => {
      socket.off('registry:safe_checkin');
    };
  }, [socket]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRecentCheckins = async () => {
    try {
      const res = await axios.get('/api/registry/recent');
      if (res.data.success) {
        setRecentCheckins(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load recent checkins:', err.message);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`/api/registry/search?q=${encodeURIComponent(searchQuery)}&district=${districtFilter}`);
      if (res.data.success) {
        setSearchResults(res.data.data || []);
      }
    } catch (err) {
      showNotification('Search failed. Please check network.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const namesArray = checkinForm.familyMembersNames
        ? checkinForm.familyMembersNames.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await axios.post('/api/registry/safe-checkin', {
        ...checkinForm,
        familyMembersCount: parseInt(checkinForm.familyMembersCount) || 1,
        familyMembersNames: namesArray
      });

      if (res.data.success) {
        showNotification(res.data.message);
        setIsCheckinModalOpen(false);
        setCheckinForm({
          citizenName: '',
          phone: '',
          shelterName: 'Chennai Girls Higher Secondary School Shelter - Triplicane',
          district: 'Chennai Coastal Zone',
          familyMembersCount: 1,
          familyMembersNames: '',
          medicalAssistanceRequired: false,
          notes: ''
        });
        fetchRecentCheckins();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Check-in failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Notifications Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-mono font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <h2 className="text-xl font-extrabold tracking-wider text-white uppercase font-mono">
              Citizen "I Am Safe" & Relative Search Registry
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Public verification portal for evacuated families. Relatives can confirm safety without clogging 108/112 emergency phone lines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCheckinModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold font-mono uppercase text-slate-950 shadow-lg shadow-emerald-950/40 hover:brightness-110 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>I Am Safe (Check-in)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Citizens Confirmed Safe</p>
          <p className="mt-1 text-2xl font-black text-emerald-400 font-mono">
            {stats.totalPeopleSafe.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Across Registered Shelters</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Family Units Checked In</p>
          <p className="mt-1 text-2xl font-black text-cyan-300 font-mono">
            {stats.totalCheckins.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Searchable by Phone/Name</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Registry Gateway</p>
          <p className="mt-1 text-base font-bold text-indigo-400 font-mono">
            24/7 National Sync
          </p>
          <span className="text-[10px] text-slate-500">Real-Time Socket Stream</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Privacy Protection</p>
          <p className="mt-1 text-base font-bold text-amber-300 font-mono">
            Masked Contacts
          </p>
          <span className="text-[10px] text-slate-500">Prevents Unsolicited Calls</span>
        </div>
      </div>

      {/* RELATIVE SEARCH PORTAL BOX */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#131D31] to-[#0B1120] p-6 shadow-2xl light-adapt-box space-y-4">
        <div className="max-w-xl">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-400" />
            <span>Search for Family Members or Relatives</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enter your relative's name, mobile number, or shelter location to confirm their arrival and safety status.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. Ramanathan, 9840012345, or Triplicane Shelter"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none shadow-inner"
            />
          </div>

          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Coastal Districts</option>
            <option value="Chennai Coastal Zone">Chennai Coastal Zone</option>
            <option value="Tiruvallur">Tiruvallur</option>
            <option value="Chengalpattu">Chengalpattu</option>
            <option value="Cuddalore">Cuddalore</option>
            <option value="Nagapattinam">Nagapattinam</option>
          </select>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 text-xs font-bold text-white uppercase font-mono tracking-wider transition shadow-lg shadow-cyan-900/40 disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Search Registry</span>
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-4 animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Found {searchResults.length} Verified Match(es):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((r) => (
                <div key={r._id} className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2 text-xs font-mono">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <span>✓</span> {r.citizenName}
                      </h5>
                      <span className="text-emerald-400 font-semibold">{r.status.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="rounded bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-300 font-bold">
                      {r.familyMembersCount} Family Members
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-cyan-400" />
                      <span>Shelter: <strong className="text-white">{r.shelterName}</strong> ({r.district})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>Phone Contact: <strong>{r.phoneMasked}</strong></span>
                    </div>
                    {r.notes && (
                      <p className="text-slate-400 italic text-[10px] bg-slate-900/60 p-2 rounded border border-slate-800 mt-1">
                        "{r.notes}"
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-500">
                    Checked in: {new Date(r.checkedInAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RECENT CHECK-INS FEED */}
      <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-5 shadow-xl light-adapt-box space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Live Verified Shelter Check-In Stream
            </h3>
          </div>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 font-mono animate-pulse">
            LIVE FEED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCheckins.slice(0, 12).map((c, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate max-w-[150px]">{c.citizenName}</span>
                <span className="text-[10px] rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-emerald-300">
                  {c.familyMembersCount || 1} Safe
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                🏠 {c.shelterName}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-1">
                <span>{c.district}</span>
                <span>{new Date(c.checkedInAt || c.time || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "I AM SAFE" CHECK-IN MODAL */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0F172A] p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Citizen Safety Check-In Form
                </h3>
                <p className="text-xs text-slate-400">
                  Record your location so relatives can verify your safety.
                </p>
              </div>
              <button onClick={() => setIsCheckinModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Your Full Name *</label>
                <input 
                  type="text"
                  required
                  value={checkinForm.citizenName}
                  onChange={e => setCheckinForm({...checkinForm, citizenName: e.target.value})}
                  placeholder="e.g. S. Meenakshi"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Mobile Phone Number *</label>
                  <input 
                    type="tel"
                    required
                    value={checkinForm.phone}
                    onChange={e => setCheckinForm({...checkinForm, phone: e.target.value})}
                    placeholder="+91 98400 99999"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Total Family Members</label>
                  <input 
                    type="number"
                    min="1"
                    max="20"
                    value={checkinForm.familyMembersCount}
                    onChange={e => setCheckinForm({...checkinForm, familyMembersCount: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Shelter / Evacuation Center *</label>
                <input 
                  type="text"
                  required
                  value={checkinForm.shelterName}
                  onChange={e => setCheckinForm({...checkinForm, shelterName: e.target.value})}
                  placeholder="e.g. Saidapet Model Higher Secondary School"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">District</label>
                  <select 
                    value={checkinForm.district}
                    onChange={e => setCheckinForm({...checkinForm, district: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Chennai Coastal Zone">Chennai Coastal Zone</option>
                    <option value="Tiruvallur">Tiruvallur</option>
                    <option value="Chengalpattu">Chengalpattu</option>
                    <option value="Cuddalore">Cuddalore</option>
                    <option value="Nagapattinam">Nagapattinam</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Status</label>
                  <select 
                    value={checkinForm.status}
                    onChange={e => setCheckinForm({...checkinForm, status: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="SAFE_IN_SHELTER">Safe in Shelter</option>
                    <option value="SAFE_AT_RELATIVE">Safe at Relative Home</option>
                    <option value="EVACUATING">En Route to Shelter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Short Message for Family</label>
                <textarea 
                  rows={2}
                  value={checkinForm.notes}
                  onChange={e => setCheckinForm({...checkinForm, notes: e.target.value})}
                  placeholder="e.g. All 4 of us arrived safely, children are fine, dry food received."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 font-bold font-mono text-slate-950 uppercase tracking-wider transition hover:brightness-110 disabled:opacity-50 shadow-lg shadow-emerald-950/40"
              >
                {submitting ? 'Confirming Registration...' : '✓ Confirm "I Am Safe" Check-In'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SafeRegistryPage;
