import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, Radio, ShieldAlert, AlertTriangle, Home,
  LifeBuoy, Truck, Bell, FileText, BarChart3, Users,
  Settings, LogOut, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Menu,
  Flame, CheckCircle2, Shield, User, HelpCircle, PhoneCall, RefreshCw,
  WifiOff, HeartHandshake, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AlertBanner from '../components/AlertBanner';
import OfflineVaultModal from '../components/OfflineVaultModal';

import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [offlineVaultOpen, setOfflineVaultOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hideTopBar, setHideTopBar] = useState(() => localStorage.getItem('hideTopBar') === 'true');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineVaultOpen(true); // Auto-open offline vault when signal is lost!
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTopBar = () => {
    setHideTopBar(prev => {
      const next = !prev;
      localStorage.setItem('hideTopBar', String(next));
      return next;
    });
  };

  const { user, logout } = useAuth();
  const { 
    connected, 
    lastUpdated, 
    liveAlerts, 
    syncRealtimeCyclones, 
    isSyncing, 
    reconnect,
    syncStatusMessage 
  } = useSocket();
  const { theme, toggleTheme, isLight } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role || 'citizen';

  const allNavSections = [
    {
      title: 'DISASTER OPS',
      items: [
        { label: 'Command Center', to: '/dashboard', icon: Compass, allowedRoles: ['admin', 'officer', 'responder', 'coordinator'] },
        { label: 'Cyclone Tracking', to: '/dashboard/cyclones', icon: Radio, allowedRoles: ['admin', 'officer', 'responder', 'coordinator', 'volunteer', 'citizen'] },
        { label: 'Impact Assessment', to: '/dashboard/risk', icon: ShieldAlert, allowedRoles: ['admin', 'officer'] },
      ]
    },
    {
      title: 'RESPONSE & SAFETY',
      items: [
        { label: 'Evacuation Planning', to: '/dashboard/evacuation', icon: NavigationIcon, allowedRoles: ['admin', 'officer', 'responder', 'coordinator', 'volunteer', 'citizen'] },
        { label: 'Shelters Management', to: '/dashboard/shelters', icon: Home, allowedRoles: ['admin', 'officer', 'responder', 'coordinator', 'volunteer', 'citizen'] },
        { label: 'Safe Persons Registry', to: '/dashboard/safe-registry', icon: HeartHandshake, highlight: true, allowedRoles: ['admin', 'officer', 'responder', 'coordinator', 'volunteer', 'citizen'] },
        { label: 'Volunteer Task Board', to: '/dashboard/volunteer-tasks', icon: ClipboardCheck, allowedRoles: ['admin', 'officer', 'coordinator', 'responder', 'volunteer'] },
        { label: 'Incident Triage', to: '/dashboard/incidents', icon: AlertTriangle, allowedRoles: ['admin', 'officer', 'responder'] },
        { label: 'Response Teams', to: '/dashboard/teams', icon: LifeBuoy, allowedRoles: ['admin', 'officer', 'responder'] },
      ]
    },
    {
      title: 'RELIEF & LOGISTICS',
      items: [
        { label: 'Relief & Inventory', to: '/dashboard/relief', icon: Truck, allowedRoles: ['admin', 'officer', 'coordinator'] },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { label: 'Emergency Alerts', to: '/dashboard/alerts', icon: Bell, allowedRoles: ['admin', 'officer'] },
        { label: 'Citizen SOS Portal', to: '/dashboard/citizen', icon: PhoneCall, highlight: true, allowedRoles: ['admin', 'officer', 'responder', 'coordinator', 'volunteer', 'citizen'] },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Analytics & Forecast', to: '/dashboard/analytics', icon: BarChart3, allowedRoles: ['admin', 'officer'] },
        { label: 'Operational Reports', to: '/dashboard/reports', icon: FileText, allowedRoles: ['admin', 'officer', 'coordinator'] },
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Personnel & Approvals', to: '/dashboard/admin', icon: Users, allowedRoles: ['admin', 'officer'] },
      ]
    }
  ];

  // Strictly filter sections and items according to the logged-in user's role
  const navSections = allNavSections
    .map(sec => ({
      ...sec,
      items: sec.items.filter(item => item.allowedRoles.includes(userRole))
    }))
    .filter(sec => sec.items.length > 0);

  function NavigationIcon(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    );
  }

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'officer':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'responder':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'coordinator':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'volunteer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'citizen':
      default:
        return 'bg-slate-700/60 text-slate-300 border-slate-600';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Chief Commander';
      case 'officer': return 'Operations Lead';
      case 'responder': return 'NDRF Responder';
      case 'coordinator': return 'Logistics Lead';
      case 'volunteer': return 'Volunteer';
      case 'citizen': return 'Citizen';
      default: return 'User';
    }
  };

  const handleHomeNavigation = () => {
    if (userRole === 'citizen' || userRole === 'volunteer') {
      navigate('/dashboard/citizen');
    } else if (userRole === 'coordinator') {
      navigate('/dashboard/relief');
    } else if (userRole === 'responder') {
      navigate('/dashboard/incidents');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0B1120] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* SIDEBAR (Desktop) */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-[#0F172A] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div 
            onClick={handleHomeNavigation}
            className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-90 transition"
            title="Go to Home"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden p-0.5 border border-cyan-500/30 bg-slate-900 shadow-lg shadow-cyan-900/30">
              <img src="/logo.png" alt="CycloneCommand Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">CYCLONE OPS</h1>
                <p className="text-[10px] text-cyan-400 font-mono uppercase">{getRoleDisplayName(userRole)}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {sec.title}
                </p>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : ''}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/20'
                          : item.highlight
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Authenticated User Profile & Logout */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/90 light-adapt-box">
          {!collapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 text-cyan-300 font-bold font-mono text-sm shadow">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate font-mono">
                    {user?.name || 'Authorized User'}
                  </p>
                  <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase font-mono tracking-wider border ${getRoleBadgeStyle(userRole)}`}>
                    {userRole.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={logout}
                className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 flex items-center justify-center transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE SLIDE-OUT DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-[#0F172A] border-r border-slate-800 z-50 h-full shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <div 
                onClick={() => { handleHomeNavigation(); setMobileOpen(false); }}
                className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
              >
                <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                <span className="text-sm font-bold text-white uppercase font-mono">CYCLONE OPS</span>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {navSections.map((sec, sIdx) => (
                <div key={sIdx}>
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {sec.title}
                  </p>
                  <div className="space-y-1">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.to;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              : item.highlight
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 p-3 bg-slate-900/90 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white truncate font-mono">{user?.name || 'Authorized User'}</p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono border ${getRoleBadgeStyle(userRole)}`}>
                  {userRole.toUpperCase()}
                </span>
              </div>
              <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-400" title="Sign Out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR (Collapsible / Hideable) */}
        {!hideTopBar && (
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0F172A]/90 px-3 sm:px-4 backdrop-blur-md z-20">
            {/* Left section: mobile hamburger + brand, desktop title + status */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white shrink-0"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Mobile compact title */}
              <div 
                onClick={handleHomeNavigation}
                className="flex md:hidden items-center gap-2 cursor-pointer shrink-0"
              >
                <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
                <span className="text-xs font-bold text-white font-mono tracking-tight whitespace-nowrap">CYCLONE OPS</span>
              </div>

              {/* Desktop Operations Center Badge */}
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 shadow-sm shrink-0">
                <span className="text-cyan-400 font-bold font-mono">Cyclone Operations Center</span>
              </div>

              {/* Live Data Connection Indicator */}
              {connected ? (
                <div 
                  className="hidden lg:flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 font-mono shadow-sm"
                  title="Live Telemetry Stream Connected (Socket.IO & Meteorological Gateway)"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">LIVE DATA CONNECTED</span>
                </div>
              ) : (
                <button
                  onClick={reconnect}
                  className="hidden lg:flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs text-amber-300 font-mono hover:bg-amber-500/25 transition cursor-pointer shadow-sm"
                  title="Connection interrupted. Click to reconnect to telemetry gateway."
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold">RECONNECT GATEWAY</span>
                </button>
              )}
            </div>

            {/* Right section: last updated, refresh, theme, notifications, profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden xl:flex flex-col text-right text-xs">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Last Updated</span>
                <span className="font-mono text-slate-300 font-semibold">{lastUpdated.toLocaleTimeString()}</span>
              </div>

              {/* On-Demand Real-Time Satellite Refresh */}
              <button
                onClick={() => syncRealtimeCyclones()}
                disabled={isSyncing}
                className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400 transition shadow-sm disabled:opacity-50 shrink-0"
                title="Fetch latest real-time cyclone telemetry from IMD, NOAA & NASA satellites"
              >
                <RefreshCw className={`h-4 w-4 shrink-0 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-cyan-300'}`} />
                <span className="hidden md:inline font-mono font-bold text-xs ml-1.5">{isSyncing ? 'SYNCING...' : 'REFRESH'}</span>
              </button>

              {/* Dark / Light Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center h-9 w-9 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white transition shadow shrink-0"
                title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              >
                {isLight ? (
                  <>
                    <Moon className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="hidden md:inline font-mono text-[11px] ml-1.5">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="hidden md:inline font-mono text-[11px] ml-1.5">Light</span>
                  </>
                )}
              </button>

              {/* Offline-First "Grid-Down" Mode Vault */}
              <button
                onClick={() => setOfflineVaultOpen(true)}
                className={`flex items-center justify-center h-9 px-2 sm:px-2.5 sm:py-1.5 rounded-lg border transition shadow-sm shrink-0 ${
                  !isOnline
                    ? 'border-rose-500 bg-rose-500/25 text-rose-300 animate-pulse'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
                title="Offline-First 'Grid-Down' Vault: Shelters, Family QR Passport, SOS Queue, Radio Frequencies"
              >
                <WifiOff className={`h-4 w-4 shrink-0 ${!isOnline ? 'text-rose-400' : 'text-amber-400'}`} />
                <span className="hidden md:inline font-mono font-bold text-xs ml-1.5">
                  {!isOnline ? 'GRID DOWN' : 'OFFLINE'}
                </span>
              </button>

              {/* Notification Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  title="Emergency Notifications"
                >
                  <Bell className="h-4 w-4 shrink-0" />
                  {liveAlerts.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white font-mono animate-pulse">
                      {liveAlerts.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-[#131D31] p-3 shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Emergency Notifications</h5>
                      <span className="text-[10px] text-cyan-400 font-mono">{liveAlerts.length} Active</span>
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                      {liveAlerts.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-500">No unacknowledged alerts</p>
                      ) : (
                        liveAlerts.map(a => (
                          <div key={a.id} className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-400 font-mono text-[10px]">{a.severity}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{new Date(a.time).toLocaleTimeString()}</span>
                            </div>
                            <p className="mt-1 font-semibold text-slate-200">{a.title}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Badge - Desktop Only */}
              <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold text-xs shadow">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{user?.name || 'Authorized Personnel'}</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">{user?.role || 'Citizen'}</span>
                </div>
              </div>

              {/* Hide / Remove Top Bar button - Desktop Only */}
              <button
                onClick={toggleTopBar}
                className="hidden md:flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition"
                title="Hide Top Navigation Bar (Maximized Workspace)"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="hidden xl:inline font-mono text-[11px]">Hide Bar</span>
              </button>

              {/* Sign Out Button - Desktop Only */}
              <button
                onClick={logout}
                className="hidden md:flex rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
        )}

        {/* BODY SCROLLABLE VIEW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0B1120] scroll-smooth">
          {/* Subtle Floating Control Bar if Top Bar is Hidden */}
          {hideTopBar && (
            <div className="flex items-center justify-between pb-3 pt-1 border-b border-slate-800/80 mb-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  Operational Grid • Bay of Bengal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => syncRealtimeCyclones()}
                  disabled={isSyncing}
                  className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs font-mono text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-50"
                  title="Sync Real-Time Cyclones"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-[11px]">{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                  title="Toggle Light/Dark Theme"
                >
                  {isLight ? <Moon className="h-3.5 w-3.5 text-indigo-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
                  <span className="text-[11px] font-mono">{isLight ? 'Dark' : 'Light'}</span>
                </button>
                <button
                  onClick={toggleTopBar}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-400 hover:bg-cyan-500/20 transition shadow-sm"
                  title="Restore Top Bar"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Show Top Bar</span>
                </button>
              </div>
            </div>
          )}

          {/* Real-Time Sync Status Banner */}
          {syncStatusMessage && (
            <div className="mb-3 rounded-lg border border-cyan-500/40 bg-cyan-500/15 p-2.5 text-xs text-cyan-200 flex items-center justify-between animate-fadeIn shadow-md">
              <div className="flex items-center gap-2 font-mono">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{syncStatusMessage}</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                Telemetry Synced
              </span>
            </div>
          )}

          <AlertBanner />
          <Outlet />

          {/* Offline Grid-Down Vault Modal */}
          <OfflineVaultModal 
            isOpen={offlineVaultOpen} 
            onClose={() => setOfflineVaultOpen(false)} 
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
