import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  ShieldAlert,
  Navigation,
  Home,
  LifeBuoy,
  Bell,
  ArrowRight,
  Shield,
  Activity,
  Users,
  ChevronRight,
  Play,
  PhoneCall,
  AlertTriangle,
  Eye,
  Compass,
  HeartPulse,
  Globe,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isLight } = useTheme();
  const { user } = useAuth();
  const {
    language,
    setLanguage,
    supportedLanguages,
    t,
    isSpeaking,
    speakEmergencyWarning,
    stopVoiceBroadcast
  } = useLanguage();

  const handleAccessSystem = () => {
    if (user) {
      if (user.role === 'citizen' || user.role === 'volunteer') {
        navigate('/dashboard/citizen');
      } else if (user.role === 'coordinator') {
        navigate('/dashboard/relief');
      } else if (user.role === 'responder') {
        navigate('/dashboard/incidents');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  const handleCitizenPortal = () => {
    if (user) {
      navigate('/dashboard/citizen');
    } else {
      navigate('/login');
    }
  };

  const capabilities = [
    {
      icon: Radio,
      color: 'from-cyan-500 to-blue-600',
      title: 'Real-Time Cyclone GIS Tracking',
      desc: 'Doppler radar tracking with animated storm eye, rotating wind bands, gale & hurricane radii, and 24h/48h/72h trajectory cones.'
    },
    {
      icon: ShieldAlert,
      color: 'from-amber-500 to-rose-600',
      title: 'Multi-Criteria Risk Scoring',
      desc: 'Algorithmic formula assessing storm surge height, proximity to landfall, population density, and infrastructure vulnerability.'
    },
    {
      icon: Navigation,
      color: 'from-purple-500 to-indigo-600',
      title: 'Dynamic Evacuation Planning',
      desc: 'Automated bottleneck-aware evacuation prioritization with multi-waypoint GPS routing directly to secure emergency shelters.'
    },
    {
      icon: Home,
      color: 'from-emerald-500 to-teal-600',
      title: 'Automated Shelter Overflow Routing',
      desc: 'Continuous capacity monitoring with automated diversion to backup inland shelters when coastal locations reach 100% full.'
    },
    {
      icon: LifeBuoy,
      color: 'from-rose-500 to-orange-600',
      title: 'Threat-to-Life Incident Dispatch',
      desc: 'Algorithmic triage ranking and automatic nearest squad dispatch (NDRF, Coast Guard, SDRF) for trapped citizens.'
    },
    {
      icon: PhoneCall,
      color: 'from-blue-500 to-cyan-600',
      title: 'Mobile-First Citizen Emergency SOS',
      desc: 'One-touch emergency beacon with immediate GPS geo-triage, nearby safe shelter navigation, and localized risk gauge.'
    }
  ];

  const quickRoles = [
    { role: 'admin', label: 'EOC Commander (Admin)', desc: 'Full authority, agency governance & audit control', email: 'admin@cycloneops.gov' },
    { role: 'officer', label: 'Operations Lead (Officer)', desc: 'GIS tracking, risk zoning, evacuation strategy', email: 'officer@cycloneops.gov' },
    { role: 'responder', label: 'NDRF Unit (Responder)', desc: 'Incident triage & amphibious squad deployment', email: 'responder@cycloneops.gov' },
    { role: 'coordinator', label: 'Logistics Head (Coordinator)', desc: 'Warehouse inventory & supply convoy logistics', email: 'coordinator@cycloneops.gov' },
    { role: 'citizen', label: 'Public Citizen (SOS View)', desc: 'Emergency SOS, nearby shelters & localized radar', email: 'citizen@cycloneops.gov' }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Dynamic Animated Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Floating Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-xl overflow-hidden p-0.5 border border-cyan-500/40 bg-slate-900 shadow-lg shadow-cyan-900/30 shrink-0">
              <img src="/logo.png" alt="CycloneCommand Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white font-mono uppercase block leading-tight">
                <span className="sm:hidden">CYCLONE</span>
                <span className="hidden sm:inline">CycloneCommand</span>
              </span>
              <span className="hidden sm:block text-[10px] font-mono text-cyan-400 font-semibold tracking-widest uppercase">
                {t('landingSubBrand')}
              </span>
            </div>
          </div>

          {/* Right Controls Bar - Strictly flex-nowrap to prevent overflowing/wrapping */}
          <div className="flex items-center gap-1 sm:gap-2 flex-nowrap shrink-0">
            {/* Regional Language Selector */}
            <div
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/90 px-1.5 py-1 sm:px-2.5 sm:py-1.5 text-xs shadow-sm shrink-0"
              title="Select Language (English, தமிழ், తెలుగు, हिन्दी, বাংলা)"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select Language"
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer font-mono"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* 1-Click Audio Voice Siren Button */}
            <button
              type="button"
              onClick={() => (isSpeaking ? stopVoiceBroadcast() : speakEmergencyWarning({ withSiren: true }))}
              className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto px-1 sm:px-3 rounded-lg border font-mono font-bold text-xs transition shadow shrink-0 ${
                isSpeaking
                  ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
                  : 'border-rose-500/50 bg-rose-600/90 text-white hover:bg-rose-500'
              }`}
              style={{ backgroundColor: '#E11D48', color: '#FFFFFF' }}
              title="Play Automated Audio Voice Siren Warning"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4 shrink-0" style={{ color: '#FFFFFF' }} />
                  <span className="hidden md:inline ml-1.5" style={{ color: '#FFFFFF' }}>{t('stopVoiceBtn')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 shrink-0" style={{ color: '#FFFFFF' }} />
                  <span className="hidden md:inline ml-1.5" style={{ color: '#FFFFFF' }}>🔊 {t('voiceSirenBtn')}</span>
                </>
              )}
            </button>

            {/* Theme Toggle - Desktop/Tablet */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg border border-slate-700 bg-slate-800/80 text-xs text-slate-300 hover:bg-slate-700 transition shrink-0"
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
            >
              {isLight ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Citizen SOS Quick Link (Large Screens) */}
            <button
              onClick={handleCitizenPortal}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition shrink-0"
            >
              <HeartPulse className="h-4 w-4 text-rose-400 animate-pulse" />
              {t('landingCitizenSosBtn')}
            </button>

            {/* Sign In Button */}
            <button
              onClick={handleAccessSystem}
              className="flex items-center justify-center rounded-lg bg-blue-600 bg-gradient-to-r from-cyan-500 to-blue-600 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition shrink-0 whitespace-nowrap"
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            >
              <span style={{ color: '#FFFFFF' }}>{t('landingSignInBtn')}</span>
              <ArrowRight className="hidden sm:inline h-3.5 w-3.5 shrink-0 ml-1" style={{ color: '#FFFFFF' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-6 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Prominent Platform Logo */}
        <div className="mx-auto mb-6 flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-3xl p-1.5 bg-gradient-to-tr from-cyan-500/30 via-blue-600/20 to-teal-400/30 shadow-2xl shadow-cyan-500/25 border border-cyan-400/40 backdrop-blur-md hover:scale-105 transition-transform duration-300">
          <img src="/logo.png" alt="CycloneCommand Official Logo" className="h-full w-full object-contain rounded-2xl drop-shadow-lg" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-mono text-cyan-300 mb-6 shadow-inner">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{t('landingStatusPill')}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white font-mono max-w-4xl mx-auto leading-tight">
          {t('landingHeroTitle')}
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          {t('landingHeroSubtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleAccessSystem}
            className="flex items-center gap-2.5 rounded-xl bg-blue-600 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-600/30 hover:scale-[1.02] transition"
            style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
          >
            <span style={{ color: '#FFFFFF' }}>{t('landingCtaCommand')}</span>
            <ArrowRight className="h-4 w-4" style={{ color: '#FFFFFF' }} />
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-6 py-3.5 text-sm font-bold text-emerald-300 shadow-lg hover:bg-emerald-500/25 transition"
          >
            <Users className="h-4 w-4 text-emerald-400" />
            {t('landingCtaVolunteer')}
          </button>

          <button
            onClick={handleCitizenPortal}
            className="flex items-center gap-2.5 rounded-xl border border-rose-500/50 bg-rose-500/10 px-6 py-3.5 text-sm font-bold text-rose-300 shadow-lg hover:bg-rose-500/20 transition"
          >
            <PhoneCall className="h-4 w-4 text-rose-400" />
            {t('landingCtaCitizen')}
          </button>
        </div>

        {/* Live Metrics Showcase */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 shadow-xl text-left">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">{t('landingMetricWind')}</span>
            <span className="text-2xl font-black font-mono text-cyan-400 mt-1 block">175 km/h</span>
            <span className="text-[11px] text-rose-400 font-semibold">Category 3 / 4</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 shadow-xl text-left">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">{t('landingMetricEvacuees')}</span>
            <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">82,000+</span>
            <span className="text-[11px] text-slate-400 font-semibold">68.4% Completed</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 shadow-xl text-left">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">{t('landingMetricShelters')}</span>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1 block">18 Units</span>
            <span className="text-[11px] text-slate-400 font-semibold">Automatic Overflow Reroute</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 shadow-xl text-left">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">{t('landingMetricResponse')}</span>
            <span className="text-2xl font-black font-mono text-purple-400 mt-1 block">18 Mins</span>
            <span className="text-[11px] text-slate-400 font-semibold">Geospatial Auto-Dispatch</span>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
            {t('landingArchTag')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold uppercase font-mono text-white mt-2">
            {t('landingArchTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-slate-800 bg-[#131D31]/95 p-6 shadow-xl transition-all duration-300 hover:border-slate-700 hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white font-mono">{c.title}</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multi-Role Operational Architecture */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block">
            {t('landingRoleTag')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-mono text-white mt-2">
            {t('landingRoleTitle')}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            {t('landingRoleSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {quickRoles.map((r, i) => (
            <div
              key={i}
              onClick={() => navigate('/login')}
              className="cursor-pointer rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 shadow-lg transition hover:border-cyan-500/50 hover:bg-slate-800/80 flex items-center justify-between"
            >
              <div>
                <h4 className="font-bold text-white text-xs font-mono">{r.label}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                <span className="text-[10px] text-cyan-400 font-mono mt-1 block">{r.email}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0F172A] py-8 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <img src="/logo.png" alt="CycloneCommand Logo" className="h-6 w-6 object-contain" />
          <span className="font-extrabold text-slate-200 tracking-wider">CYCLONECOMMAND EOC</span>
        </div>
        <p>Cyclone Disaster Management, Impact Prediction & Emergency Relief Operations Platform</p>
        <p className="mt-1 text-slate-600">Built for NDMA, NDRF, State Disaster Management Authorities & IMD</p>
      </footer>
    </div>
  );
};

export default LandingPage;
