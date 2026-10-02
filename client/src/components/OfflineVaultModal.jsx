import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, Shield, Radio, HeartPulse, QrCode, Phone, MapPin, 
  CheckCircle2, AlertTriangle, X, Download, Copy, Share2
} from 'lucide-react';
import { 
  getCachedShelters, 
  EMERGENCY_BROADCAST_FREQUENCIES, 
  OFFLINE_FIRST_AID_GUIDE, 
  getQueuedOfflineSos,
  syncOfflineSosQueue 
} from '../utils/offlineManager';

const OfflineVaultModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('shelters');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedSos, setQueuedSos] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [copied, setCopied] = useState(false);

  // Family QR Passport State
  const [passport, setPassport] = useState(() => {
    try {
      const saved = localStorage.getItem('cyclone_family_passport');
      return saved ? JSON.parse(saved) : {
        headOfFamily: '',
        contactPhone: '',
        totalMembers: 4,
        district: 'Chennai Coastal Zone',
        specialNeeds: 'Infant / Elderly care',
        bloodGroup: 'O+'
      };
    } catch (e) {
      return { headOfFamily: '', contactPhone: '', totalMembers: 4, district: 'Chennai', specialNeeds: '', bloodGroup: 'O+' };
    }
  });

  const [passportSaved, setPassportSaved] = useState(false);

  useEffect(() => {
    setShelters(getCachedShelters());
    setQueuedSos(getQueuedOfflineSos());

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineSosQueue((count) => {
        setQueuedSos(getQueuedOfflineSos());
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const handleSavePassport = (e) => {
    e.preventDefault();
    localStorage.setItem('cyclone_family_passport', JSON.stringify(passport));
    setPassportSaved(true);
    setTimeout(() => setPassportSaved(false), 3000);
  };

  const passportString = `CYCLONE-OPS-PASSPORT | Name: ${passport.headOfFamily || 'Resident'} | Phone: ${passport.contactPhone} | Members: ${passport.totalMembers} | District: ${passport.district} | Needs: ${passport.specialNeeds || 'None'} | Blood: ${passport.bloodGroup}`;

  const copyPassportToClipboard = () => {
    navigator.clipboard.writeText(passportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-700 bg-[#0F172A] shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Header with Connectivity Status */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              isOnline 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white font-mono">
                  Offline Emergency Vault
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                }`}>
                  {isOnline ? 'ONLINE & SYNCED' : 'GRID-DOWN OFFLINE MODE'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% accessible without internet, cellular network, or Wi-Fi.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Queued SOS notice if any offline SOS is pending */}
        {queuedSos.length > 0 && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300 font-mono">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span><strong>{queuedSos.length} Offline SOS Request(s)</strong> stored locally.</span>
            </span>
            <span>Will auto-dispatch on signal recovery.</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-900/50 p-2 overflow-x-auto scrollbar-thin">
          {[
            { id: 'shelters', label: 'Offline Shelters', icon: MapPin },
            { id: 'passport', label: 'Family QR Passport', icon: QrCode },
            { id: 'radio', label: 'Radio Frequencies', icon: Radio },
            { id: 'firstaid', label: 'First-Aid Guide', icon: HeartPulse }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                  active 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: OFFLINE SHELTER DIRECTORY */}
          {activeTab === 'shelters' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-mono">
                These shelters are pre-cached in your device memory. You can navigate to them or dial their emergency landlines even if towers are down.
              </p>
              <div className="space-y-2.5">
                {shelters.map((s, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{s.name}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5">{s.address} • {s.district}</p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                        {s.capacity} Beds
                      </span>
                    </div>

                    {s.features && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.features.map((f, fIdx) => (
                          <span key={fIdx} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700 font-mono">
                            ✓ {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] font-mono">
                      <span className="text-slate-400">Landline: <strong className="text-white">{s.contactPhone}</strong></span>
                      <a 
                        href={`tel:${s.contactPhone}`} 
                        className="flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                      >
                        <Phone className="h-3 w-3" /> Call Hotline
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FAMILY QR CODE PASSPORT */}
          {activeTab === 'passport' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 font-mono">
                Generate your family's offline digital admission pass. When arriving at a shelter, the relief officer can scan or record this directly without paperwork delay.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form onSubmit={handleSavePassport} className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Head of Family / Name</label>
                    <input 
                      type="text"
                      value={passport.headOfFamily}
                      onChange={e => setPassport({...passport, headOfFamily: e.target.value})}
                      placeholder="e.g. S. Ramanathan"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Contact Phone</label>
                      <input 
                        type="text"
                        value={passport.contactPhone}
                        onChange={e => setPassport({...passport, contactPhone: e.target.value})}
                        placeholder="+91 98400 12345"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Family Members</label>
                      <input 
                        type="number"
                        min="1"
                        max="20"
                        value={passport.totalMembers}
                        onChange={e => setPassport({...passport, totalMembers: parseInt(e.target.value) || 1})}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Coastal District</label>
                      <select 
                        value={passport.district}
                        onChange={e => setPassport({...passport, district: e.target.value})}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="Chennai Coastal Zone">Chennai Coastal Zone</option>
                        <option value="Tiruvallur / Ennore">Tiruvallur / Ennore</option>
                        <option value="Chengalpattu">Chengalpattu</option>
                        <option value="Cuddalore">Cuddalore</option>
                        <option value="Nagapattinam">Nagapattinam</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Blood Group</label>
                      <input 
                        type="text"
                        value={passport.bloodGroup}
                        onChange={e => setPassport({...passport, bloodGroup: e.target.value})}
                        placeholder="O+, A+, B+, AB+"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Medical Needs / Alerts</label>
                    <input 
                      type="text"
                      value={passport.specialNeeds}
                      onChange={e => setPassport({...passport, specialNeeds: e.target.value})}
                      placeholder="e.g. Diabetics / Insulin required, Infant, Wheelchair"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2 font-bold text-white text-xs transition"
                  >
                    {passportSaved ? '✓ Saved to Device Memory' : 'Save Offline Passport'}
                  </button>
                </form>

                {/* Simulated Digital Passport Badge */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700 bg-slate-900/90 text-center space-y-2.5">
                  <div className="p-3 bg-white rounded-xl shadow-lg">
                    {/* High-Contrast SVG QR Pattern */}
                    <div className="h-32 w-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-400 bg-slate-50 text-slate-800 p-2">
                      <QrCode className="h-16 w-16 text-slate-900" />
                      <span className="text-[8px] font-bold font-mono tracking-tighter mt-1 text-slate-700">OFFLINE ADMISSION TOKEN</span>
                    </div>
                  </div>

                  <div className="text-left w-full text-[11px] font-mono space-y-0.5 border-t border-slate-800 pt-2">
                    <p className="font-bold text-white truncate">{passport.headOfFamily || 'Family Pass'}</p>
                    <p className="text-slate-400">Total Members: <strong className="text-cyan-300">{passport.totalMembers}</strong> • {passport.district}</p>
                    {passport.specialNeeds && <p className="text-amber-300 text-[10px]">Alert: {passport.specialNeeds}</p>}
                  </div>

                  <button
                    onClick={copyPassportToClipboard}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copied ? 'Copied Passport String' : 'Copy Digital String'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RADIO FREQUENCIES */}
          {activeTab === 'radio' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-mono">
                When mobile towers and electricity collapse, tune any battery-operated transistor radio to these verified state broadcasting channels for live updates.
              </p>
              <div className="space-y-2">
                {EMERGENCY_BROADCAST_FREQUENCIES.map((rf, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs font-mono">
                    <div>
                      <h4 className="font-bold text-white text-[13px]">{rf.agency}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rf.purpose}</p>
                    </div>
                    <span className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-300">
                      📻 {rf.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: OFFLINE FIRST-AID GUIDE */}
          {activeTab === 'firstaid' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 font-mono">
                Field-tested protocol for emergency trauma, water purification, and flood exposure during active storms.
              </p>
              <div className="space-y-2.5">
                {OFFLINE_FIRST_AID_GUIDE.map((g, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs font-mono space-y-1">
                    <h5 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                      <span>⚠️</span> {g.title}
                    </h5>
                    <p className="text-slate-300 text-[11px] leading-relaxed pl-5">
                      {g.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/90 flex items-center justify-between text-xs font-mono">
          <span className="text-[11px] text-slate-400">
            Emergency Cache: <strong className="text-emerald-400">Active in Local Memory</strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-1.5 font-bold text-slate-200 transition"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};

export default OfflineVaultModal;
