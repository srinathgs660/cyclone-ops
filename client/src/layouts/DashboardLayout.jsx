import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, Radio, ShieldAlert, AlertTriangle, Home,
  LifeBuoy, Truck, Bell, FileText, BarChart3, Users,
  Settings, LogOut, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Menu,
  Flame, CheckCircle2, Shield, User, HelpCircle, PhoneCall, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import AlertBanner from '../components/AlertBanner';

import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(() => localStorage.getItem('hideTopBar') === 'true');

  const toggleTopBar = () => {
    setHideTopBar(prev => {
      const next = !prev;
      localStorage.setItem('hideTopBar', String(next));
      return next;
    });
  };

  const { user, logout, quickLogin } = useAuth();
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

  const navSections = [
    {
      title: 'DISASTER OPS',
      items: [
        { label: 'Command Center', to: '/dashboard', icon: Compass },
        { label: 'Cyclone Tracking', to: '/dashboard/cyclones', icon: Radio },
        { label: 'Impact Assessment', to: '/dashboard/risk', icon: ShieldAlert },
      ]
    },
    {
      title: 'RESPONSE',
      items: [
        { label: 'Evacuation Planning', to: '/dashboard/evacuation', icon: NavigationIcon },
        { label: 'Shelters Management', to: '/dashboard/shelters', icon: Home },
        { label: 'Incident Triage', to: '/dashboard/incidents', icon: AlertTriangle },
        { label: 'Response Teams', to: '/dashboard/teams', icon: LifeBuoy },
      ]
    },
    {
      title: 'RELIEF',
      items: [
        { label: 'Relief & Inventory', to: '/dashboard/relief', icon: Truck },
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { label: 'Emergency Alerts', to: '/dashboard/alerts', icon: Bell },
        { label: 'Citizen SOS Portal', to: '/dashboard/citizen', icon: PhoneCall, highlight: true },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Analytics & Forecast', to: '/dashboard/analytics', icon: BarChart3 },
        { label: 'Operational Reports', to: '/dashboard/reports', icon: FileText },
      ]
    },
    {
      title: 'ADMIN',
      items: [
        { label: 'Administration', to: '/dashboard/admin', icon: Users, roleRequired: 'admin' },
      ]
    }
  ];

  function NavigationIcon(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    );
  }

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
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-90 transition"
            title="Go to Command Center"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden p-0.5 border border-cyan-500/30 bg-slate-900 shadow-lg shadow-cyan-900/30">
              <img src="/logo.png" alt="CycloneCommand Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-extrabold tracking-wider text-white uppercase font-mono">CYCLONE OPS</h1>
                <p className="text-[10px] text-cyan-400 font-mono">EOC COMMAND CENTER</p>
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
          {navSections.map((sec, sIdx) => {
            const filteredItems = sec.items.filter(
              item => !item.roleRequired || user?.role === item.roleRequired
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={sIdx}>
                {!collapsed && (
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {sec.title}
                  </p>
                )}
                <div className="space-y-1">
                  {filteredItems.map((item) => {
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
            );
          })}
        </div>

        {/* Sidebar Footer: Redesigned Quick Demo Role Switcher */}
        <div className="border-t border-slate-700/80 p-3 bg-slate-900/90 light-adapt-box">
          {!collapsed ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">Demo Role Switcher</span>
                <span className="text-[9px] font-mono text-slate-400">1-Click</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                {[
                  { role: 'admin', label: 'Admin', icon: '👑' },
                  { role: 'officer', label: 'Officer', icon: '🎖️' },
                  { role: 'responder', label: 'NDRF', icon: '🚑' },
                  { role: 'coordinator', label: 'Logistics', icon: '📦' },
                  { role: 'volunteer', label: 'Volunteer', icon: '🤝' },
                  { role: 'citizen', label: 'Citizen', icon: '👤' }
                ].map((r) => {
                  const isActive = user?.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={async () => {
                        await quickLogin(r.role);
                        if (r.role === 'citizen') {
                          navigate('/dashboard/citizen');
                        }
                      }}
                      className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 font-bold transition shadow-sm border ${
                        isActive
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-cyan-400 ring-1 ring-cyan-400/50'
                          : 'bg-slate-800/90 text-slate-300 border-slate-700/70 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={`Switch to ${r.label} mode`}
                    >
                      <span className="text-xs mb-0.5">{r.icon}</span>
                      <span className="text-[9px] uppercase tracking-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => quickLogin(user?.role === 'officer' ? 'citizen' : 'officer')}
                className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-xs font-bold font-mono hover:bg-cyan-500/30 transition"
                title="Toggle Role"
              >
                {user?.role?.[0]?.toUpperCase() || 'O'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR (Collapsible / Hideable) */}
        {!hideTopBar && (
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0F172A]/90 px-4 backdrop-blur-md z-20">
            {/* Left section: mobile hamburger & region selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 shadow-sm">
                <span className="text-cyan-400 font-bold font-mono">Cyclone Operations Center</span>
                <span className="text-slate-500 font-mono">|</span>
                <span className="font-semibold text-white">Bay of Bengal Sector (Amara)</span>
              </div>

              {/* On-Demand Real-Time Satellite Refresh */}
              <button
                onClick={() => syncRealtimeCyclones()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400 transition shadow-sm disabled:opacity-50"
                title="Fetch latest real-time cyclone telemetry from IMD, NOAA & NASA satellites"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-cyan-300'}`} />
                <span className="hidden sm:inline">{isSyncing ? 'SYNCING SATELLITES...' : 'REFRESH REAL-TIME'}</span>
              </button>

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

            {/* Right section: last updated, notifications, theme, hide top bar, profile, logout */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Last Updated</span>
                <span className="font-mono text-slate-300 font-semibold">{lastUpdated.toLocaleTimeString()}</span>
              </div>

              {/* Dark / Light Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-750 hover:text-white transition shadow"
                title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              >
                {isLight ? (
                  <>
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span className="hidden md:inline font-mono text-[11px]">Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span className="hidden md:inline font-mono text-[11px]">Light</span>
                  </>
                )}
              </button>

              {/* Notification Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition"
                >
                  <Bell className="h-4 w-4" />
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

              {/* User Badge */}
              <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold text-xs shadow">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none">{user?.name || 'Authorized Personnel'}</span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">{user?.role || 'Citizen'}</span>
                </div>
              </div>

              {/* Hide / Remove Top Bar button */}
              <button
                onClick={toggleTopBar}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition"
                title="Hide Top Navigation Bar (Maximized Workspace)"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="hidden xl:inline font-mono text-[11px]">Hide Bar</span>
              </button>

              <button
                onClick={logout}
                className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
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
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
