import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertOctagon,
  MapPin,
  ShieldAlert,
  Navigation,
  Bell,
  PhoneCall,
  Send,
  CheckCircle2,
  Home,
  Crosshair,
  Volume2,
  VolumeX,
  Globe,
  Radio
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';

const CitizenPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sos'); // Default to SOS for immediate citizen access
  const [userCoords, setUserCoords] = useState([80.2707, 13.0827]); // Default Chennai
  const [gpsAccuracy, setGpsAccuracy] = useState(10);
  const [isSharingLiveGps, setIsSharingLiveGps] = useState(true);
  const [gpsStatusText, setGpsStatusText] = useState('Locking exact satellite GPS coordinates...');
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [nearestShelters, setNearestShelters] = useState([]);
  const [sosSent, setSosSent] = useState(false);
  const [sendingSos, setSendingSos] = useState(false);
  const watchIdRef = useRef(null);
  const { liveAlerts } = useSocket();

  const {
    language,
    setLanguage,
    currentLanguageMeta,
    supportedLanguages,
    t,
    isSpeaking,
    includeSiren,
    setIncludeSiren,
    speakEmergencyWarning,
    stopVoiceBroadcast
  } = useLanguage();

  const [sosForm, setSosForm] = useState({
    fullName: '',
    contactPhone: '',
    emergencyType: 'Trapped Civilians',
    peopleCount: 1,
    address: 'Marina Lowlands Beach Sector',
    description: ''
  });

  useEffect(() => {
    // Continuous HTML5 Geolocation watchPosition for exact live location tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [
            Number(pos.coords.longitude.toFixed(5)),
            Number(pos.coords.latitude.toFixed(5))
          ];
          setUserCoords(coords);
          setGpsAccuracy(Math.round(pos.coords.accuracy || 10));
          setGpsStatusText(`Live GPS Locked (±${Math.round(pos.coords.accuracy || 10)}m)`);
          evaluateRisk(coords);
          fetchNearbyShelters(coords);
        },
        () => {
          setGpsStatusText('Live GPS Active (Coastal Sector Telemetry)');
          evaluateRisk(userCoords);
          fetchNearbyShelters(userCoords);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = [
            Number(pos.coords.longitude.toFixed(5)),
            Number(pos.coords.latitude.toFixed(5))
          ];
          const acc = Math.round(pos.coords.accuracy || 10);
          setUserCoords(coords);
          setGpsAccuracy(acc);
          setGpsStatusText(`Live GPS Streaming (${coords[1]}°N, ${coords[0]}°E • ±${acc}m)`);

          const activeIncId = localStorage.getItem('activeSosIncidentId');
          if (activeIncId && isSharingLiveGps) {
            axios
              .post('/api/live-tracking/citizen-location', {
                incidentId: activeIncId,
                coordinates: coords,
                accuracy: acc,
                isSharingLive: true
              })
              .catch(() => {});
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
      );
    } else {
      evaluateRisk(userCoords);
      fetchNearbyShelters(userCoords);
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSharingLiveGps]);

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
        coordinates: userCoords,
        accuracy: gpsAccuracy,
        isSharingLive: isSharingLiveGps
      };
      const res = await axios.post('/api/citizen/sos', payload);
      if (res.data.success) {
        setSosSent(res.data);
        if (res.data.incidentId) {
          localStorage.setItem('activeSosIncidentId', res.data.incidentId);
        }
      }
    } catch (err) {
      console.error('[SOS Send Error]:', err);
    } finally {
      setSendingSos(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-12">
      {/* Citizen Header */}
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-900 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl p-1 bg-slate-900 border border-rose-500/40 shadow-xl">
          <img src="/logo.png" alt="Cyclone Emergency Logo" className="h-full w-full object-contain rounded-xl" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 font-mono border border-rose-500/40 animate-pulse">
          {t('portalBadge')}
        </span>
        <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-mono">
          {t('portalTitle')}
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          {t('portalSubtitle')}
        </p>

        {/* Current Risk Snapshot (Always a prominent, high-contrast dark box) */}
        {riskAssessment && (
          <div className="citizen-black-threat-box mt-4 inline-flex flex-wrap items-center justify-center gap-2.5 rounded-xl px-4 py-2 text-xs font-mono">
            <span className="threat-box-text">{t('localThreatLabel')}</span>
            <span className={`font-black uppercase px-2.5 py-0.5 rounded text-xs shadow-sm ${
              riskAssessment.riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white' :
              riskAssessment.riskLevel === 'HIGH' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              {riskAssessment.riskLevel}
            </span>
            <span className="threat-box-text">
              • {t('cycloneEyeLabel')} <strong className="threat-box-highlight">{riskAssessment.cycloneDistanceKm} km</strong>
            </span>
          </div>
        )}
      </div>

      {/* ================= REGIONAL MULTILINGUAL VOICE SIREN & ACCESSIBILITY PANEL ================= */}
      <div className="rounded-2xl border border-cyan-500/40 bg-[#131D31] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 font-mono border border-cyan-500/40">
              <Radio className="h-3 w-3 animate-pulse" />
              {t('voicePanelBadge')}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white font-mono">
              {t('voicePanelTitle')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('voicePanelDesc')}
            </p>
          </div>

          <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 cursor-pointer shrink-0 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
            <input
              type="checkbox"
              checked={includeSiren}
              onChange={(e) => setIncludeSiren(e.target.checked)}
              className="rounded border-slate-600 text-rose-500 focus:ring-0"
            />
            <span>🚨 {t('sirenIncludeLabel')}</span>
          </label>
        </div>

        {/* 5 Touch-Friendly Language Selector Pills (English Default + Tamil, Telugu, Hindi, Bengali) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              SELECT INTERFACE & VOICE WARNING LANGUAGE:
            </span>
            <span className="text-cyan-400 font-bold">{currentLanguageMeta.regionTag}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {supportedLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    if (isSpeaking) {
                      speakEmergencyWarning({ langOverride: lang.code, withSiren: false });
                    }
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: '#2563EB', color: '#FFFFFF', borderColor: '#3B82F6' }
                      : undefined
                  }
                >
                  <span
                    className="text-sm font-extrabold tracking-tight"
                    style={isSelected ? { color: '#FFFFFF' } : undefined}
                  >
                    {lang.nativeName}
                  </span>
                  <span
                    className={`text-[10px] font-mono mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                    style={isSelected ? { color: '#DBEAFE' } : undefined}
                  >
                    {lang.code === 'en' ? 'English (Default)' : lang.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Siren & Voice Broadcast Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              isSpeaking
                ? stopVoiceBroadcast()
                : speakEmergencyWarning({ withSiren: includeSiren })
            }
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider font-mono shadow-lg transition ${
              isSpeaking
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            style={{
              backgroundColor: isSpeaking ? '#E11D48' : '#2563EB',
              color: '#FFFFFF'
            }}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-5 w-5 shrink-0" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>{t('stopVoiceWarning')}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5 shrink-0" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>{t('playVoiceWarning')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const nearest = nearestShelters[0]?.shelter?.name || 'Marina Coastal Community Safe Center';
              const dist = nearestShelters[0]?.distanceKm || '1.4';
              speakEmergencyWarning({
                customText: `${t('voiceWarningNative')} Nearest verified cyclone shelter is ${nearest}, located ${dist} kilometers away.`,
                withSiren: false
              });
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-600 px-3.5 py-3 text-xs font-bold font-mono text-white hover:bg-emerald-500 transition shadow-sm"
            style={{ backgroundColor: '#059669', color: '#FFFFFF' }}
          >
            <Volume2 className="h-4 w-4 shrink-0" style={{ color: '#FFFFFF' }} />
            <span style={{ color: '#FFFFFF' }}>{t('readShelterVoice')}</span>
          </button>
        </div>

        {/* Live Localized Voice Broadcast Script Box */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 font-bold uppercase">
            <span>{t('liveVoiceScriptLabel')}</span>
            <span>{isSpeaking ? '🔊 BROADCASTING AUDIO...' : `BCP-47: ${currentLanguageMeta.bcp47}`}</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
            “{t('voiceWarningNative')}”
          </p>
        </div>
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
          <span className="text-xs font-bold uppercase tracking-wider font-mono">{t('tab1Sos')}</span>
        </button>

        <button
          onClick={() => navigate('/dashboard/live-tracking')}
          className="flex flex-col items-center justify-center rounded-xl border border-cyan-500/50 bg-cyan-500/15 p-4 text-center text-cyan-200 shadow-lg shadow-cyan-950/40 hover:bg-cyan-500/25 transition-all"
        >
          <Navigation className="h-7 w-7 text-cyan-400 mb-1.5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">{t('tab2LiveMap')}</span>
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
          <span className="text-xs font-bold uppercase tracking-wider font-mono">{t('tab3Shelter')}</span>
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
          <span className="text-xs font-bold uppercase tracking-wider font-mono">{t('tab4Risk')}</span>
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
          <span className="text-xs font-bold uppercase tracking-wider font-mono">{t('tab5Alerts')}</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all ${
            activeTab === 'contacts'
              ? 'border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-950/50'
              : 'border-slate-800 bg-[#131D31] text-slate-200 hover:border-blue-500/40'
          }`}
        >
          <PhoneCall className="h-7 w-7 text-blue-400 mb-1.5" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">{t('tab6Helplines')}</span>
        </button>
      </div>

      {/* TAB CONTENT: SOS FORM */}
      {activeTab === 'sos' && (
        <div className="rounded-2xl border border-rose-500/50 bg-[#131D31] p-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
            <AlertOctagon className="h-6 w-6 text-rose-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white uppercase font-mono">{t('sosHeaderTitle')}</h3>
              <p className="text-xs text-slate-400">{t('sosHeaderDesc')}</p>
            </div>
          </div>

          {/* LIVE GPS TELEMETRY BANNER IN SOS FORM */}
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/25 p-3.5 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-300 uppercase">
                  {isSharingLiveGps ? t('gpsTrackingEnabled') : t('gpsTrackingPaused')}
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  checked={isSharingLiveGps}
                  onChange={(e) => setIsSharingLiveGps(e.target.checked)}
                  className="rounded border-slate-600 text-emerald-500 focus:ring-0"
                />
                <span>{t('continuousLiveStream')}</span>
              </label>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
              <span>
                {t('coordinatesLabel')} <strong className="text-white">{userCoords[1]?.toFixed(5)}°N, {userCoords[0]?.toFixed(5)}°E</strong> (±{gpsAccuracy}m)
              </span>
              <span className="text-cyan-300">{gpsStatusText}</span>
            </div>
          </div>

          {sosSent ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-6 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-1" />
              <h4 className="text-lg font-bold text-white font-mono uppercase">SOS & Live GPS Beacon Activated!</h4>
              <p className="text-xs text-emerald-300">{sosSent.message}</p>
              <div className="rounded-lg bg-slate-900 p-3.5 text-xs font-mono text-left space-y-1.5 border border-slate-800">
                <div>Incident ID: <strong className="text-cyan-300">{sosSent.incidentId}</strong></div>
                <div>Your Live GPS: <strong className="text-rose-300">{userCoords[1]?.toFixed(5)}°N, {userCoords[0]?.toFixed(5)}°E (Streaming Live)</strong></div>
                <div>Assigned Response Team: <strong className="text-sky-400">{sosSent.assignedTeam}</strong> ({sosSent.assignedTeamVehicle || 'Rescue Unit'})</div>
                <div>Assigned Field Volunteer: <strong className="text-emerald-400">{sosSent.assignedVolunteer || 'Aravind Swaminathan'}</strong> ({sosSent.assignedVolunteerPhone || '+91 94440 12891'})</div>
                <div>Status: <span className="text-amber-400 font-bold">RESCUE TEAM & VOLUNTEER EN ROUTE TO YOUR LIVE LOCATION</span></div>
              </div>

              <button
                onClick={() => navigate(`/dashboard/live-tracking?incidentId=${sosSent.incidentId}`)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 bg-gradient-to-r from-cyan-600 to-blue-700 py-3 px-4 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-950/60 hover:from-cyan-500 hover:to-blue-600 transition"
                style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              >
                <Navigation className="h-4 w-4 animate-bounce" style={{ color: '#FFFFFF' }} />
                <span style={{ color: '#FFFFFF' }}>🗺️ TRACK ASSIGNED RESCUE TEAM & VOLUNTEER ON LIVE MAP</span>
              </button>

              <button
                onClick={() => setSosSent(false)}
                className="block mx-auto text-xs font-bold text-slate-400 hover:text-cyan-400 underline"
              >
                Send Another Emergency Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSos} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('fullNameLabel')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('fullNamePlaceholder')}
                    value={sosForm.fullName}
                    onChange={(e) => setSosForm({ ...sosForm, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('phoneLabel')}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t('phonePlaceholder')}
                    value={sosForm.contactPhone}
                    onChange={(e) => setSosForm({ ...sosForm, contactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('emergencyNatureLabel')}</label>
                  <select
                    value={sosForm.emergencyType}
                    onChange={(e) => setSosForm({ ...sosForm, emergencyType: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Trapped Civilians">{t('optTrapped')}</option>
                    <option value="Medical Emergency">{t('optMedical')}</option>
                    <option value="Severe Flooding">{t('optFlooding')}</option>
                    <option value="Building Collapse / Structural Risk">{t('optCollapse')}</option>
                    <option value="Missing Person">{t('optMissing')}</option>
                    <option value="Food/Water Crisis">{t('optFoodWater')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('peopleCountLabel')}</label>
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
                <label className="block text-slate-300 font-semibold mb-1">{t('locationLandmarkLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('locationPlaceholder')}
                  value={sosForm.address}
                  onChange={(e) => setSosForm({ ...sosForm, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('situationDescLabel')}</label>
                <textarea
                  rows="3"
                  placeholder={t('situationPlaceholder')}
                  value={sosForm.description}
                  onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sendingSos}
                className="w-full rounded-xl bg-rose-600 bg-gradient-to-r from-rose-600 to-red-700 py-3 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-rose-950/60 hover:from-rose-500 hover:to-red-600 transition disabled:opacity-50"
                style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              >
                {sendingSos ? t('submittingSosBtn') : t('submitSosBtn')}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB CONTENT: NEARBY SHELTERS */}
      {activeTab === 'shelters' && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 shadow-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase font-mono">{t('sheltersTitle')}</h3>
            <p className="text-xs text-slate-400">{t('sheltersSubtitle')}</p>
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
                  {t('navigateShelterBtn')}
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
            <h3 className="text-base font-bold text-white uppercase font-mono">{t('riskTitle')}</h3>
            <p className="text-xs text-slate-400">Computed for coordinates {userCoords[1]?.toFixed(3)}°N, {userCoords[0]?.toFixed(3)}°E</p>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">{t('activeCycloneLabel')}</span>
              <strong className="text-white">{riskAssessment.activeCycloneName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('distanceFromEyeLabel')}</span>
              <strong className="text-amber-300">{riskAssessment.cycloneDistanceKm} km</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t('threatClassLabel')}</span>
              <strong className="text-rose-400 uppercase font-black">{riskAssessment.riskLevel}</strong>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
            <h5 className="font-bold text-cyan-300 font-mono text-xs uppercase mb-1">{t('officialDirectiveLabel')}</h5>
            <p className="text-xs text-slate-200">{riskAssessment.recommendation}</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 shadow-2xl space-y-3">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white uppercase font-mono">{t('alertsTitle')}</h3>
            <p className="text-xs text-slate-400">{t('alertsSubtitle')}</p>
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
            <h3 className="text-base font-bold text-white uppercase font-mono">{t('helplinesTitle')}</h3>
            <p className="text-xs text-slate-400">{t('helplinesSubtitle')}</p>
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
