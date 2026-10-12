import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  Tooltip,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import {
  Radio,
  MapPin,
  Navigation,
  ShieldAlert,
  PhoneCall,
  Users,
  Truck,
  HeartHandshake,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Crosshair,
  AlertOctagon,
  Clock,
  Activity,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Custom Leaflet DivIcons for Citizen SOS, Response Team, and Volunteer
const createCitizenSosIcon = () =>
  L.divIcon({
    className: 'custom-sos-marker',
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:44px;height:44px;border-radius:9999px;background:rgba(244,63,94,0.35);animation:ping 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position:absolute;width:32px;height:32px;border-radius:9999px;background:rgba(225,29,72,0.55);border:2px solid #fda4af;"></div>
        <div style="position:relative;z-index:10;width:24px;height:24px;border-radius:9999px;background:#e11d48;border:2.5px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(225,29,72,0.95);font-size:11px;font-weight:900;color:#fff;">
          SOS
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
  });

const createResponseTeamIcon = (isAssigned = true) =>
  L.divIcon({
    className: 'custom-team-marker',
    html: `
      <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        ${
          isAssigned
            ? `<div style="position:absolute;width:40px;height:40px;border-radius:9999px;background:rgba(6,182,212,0.3);animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>`
            : ''
        }
        <div style="position:relative;z-index:10;width:30px;height:30px;border-radius:10px;background:${
          isAssigned ? '#0284c7' : '#334155'
        };border:2.5px solid #e0f2fe;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(14,165,233,0.9);font-size:15px;">
          🚒
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18]
  });

const createVolunteerIcon = (isAssigned = true) =>
  L.divIcon({
    className: 'custom-volunteer-marker',
    html: `
      <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
        ${
          isAssigned
            ? `<div style="position:absolute;width:38px;height:38px;border-radius:9999px;background:rgba(16,185,129,0.3);animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>`
            : ''
        }
        <div style="position:relative;z-index:10;width:28px;height:28px;border-radius:9999px;background:${
          isAssigned ? '#059669' : '#1e293b'
        };border:2.5px solid #d1fae5;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(16,185,129,0.85);font-size:14px;">
          🦺
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });

// Map helper to smoothly pan when selected session changes
const MapViewUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, map.getZoom() < 13 ? 14 : map.getZoom(), { duration: 0.9 });
    }
  }, [center, map]);
  return null;
};

// Map click handler for testing/updating live pin position
const MapClickPinMover = ({ enabled, onPickCoordinates }) => {
  useMapEvents({
    click(e) {
      if (enabled && onPickCoordinates) {
        onPickCoordinates([
          Number(e.latlng.lng.toFixed(5)),
          Number(e.latlng.lat.toFixed(5))
        ]);
      }
    }
  });
  return null;
};

const LiveTrackingPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live GPS Watch state
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [myGpsCoords, setMyGpsCoords] = useState([80.2707, 13.0827]);
  const [gpsAccuracy, setGpsAccuracy] = useState(10);
  const [lastGpsPingTime, setLastGpsPingTime] = useState(null);
  const watchIdRef = useRef(null);

  // Map interactive states
  const [layerFilter, setLayerFilter] = useState('all'); // all, citizen, teams, volunteers
  const [tileStyle, setTileStyle] = useState('osm'); // 'osm' | 'satellite' | 'dark'
  const [clickMode, setClickMode] = useState(null); // null | 'citizen' | 'team' | 'volunteer'
  const [simulatingApproach, setSimulatingApproach] = useState(false);
  const simIntervalRef = useRef(null);
  const [creatingTestSos, setCreatingTestSos] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  const requestedIncidentId =
    searchParams.get('incidentId') || localStorage.getItem('activeSosIncidentId') || '';

  const fetchOverview = useCallback(async (preferredId = requestedIncidentId) => {
    try {
      const res = await axios.get('/api/live-tracking/overview');
      if (res.data?.success) {
        const list = res.data.activeSosSessions || [];
        setSessions(list);
        setAllTeams(res.data.responseTeams || []);
        setAllVolunteers(res.data.volunteers || []);

        if (list.length > 0) {
          const match = preferredId
            ? list.find(
                (s) =>
                  s.incidentId === preferredId || String(s._id) === String(preferredId)
              )
            : null;
          setSelectedSession((prev) => {
            if (match) return match;
            if (prev) {
              const updatedPrev = list.find((s) => s.incidentId === prev.incidentId);
              if (updatedPrev) return updatedPrev;
            }
            return list[0];
          });
        }
      }
    } catch (err) {
      console.error('[Live Tracking Overview Error]:', err);
    } finally {
      setLoading(false);
    }
  }, [requestedIncidentId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Listen to real-time Socket.IO location & SOS events
  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = (updatedSession) => {
      if (!updatedSession?.incidentId) return;
      setSessions((prev) => {
        const exists = prev.some((s) => s.incidentId === updatedSession.incidentId);
        if (!exists) return [updatedSession, ...prev];
        return prev.map((s) =>
          s.incidentId === updatedSession.incidentId ? updatedSession : s
        );
      });
      setSelectedSession((prev) =>
        prev && prev.incidentId === updatedSession.incidentId ? updatedSession : prev
      );
    };

    const handleNewSos = () => {
      fetchOverview();
    };

    socket.on('tracking:location_update', handleLocationUpdate);
    socket.on('tracking:sos_started', handleNewSos);

    return () => {
      socket.off('tracking:location_update', handleLocationUpdate);
      socket.off('tracking:sos_started', handleNewSos);
    };
  }, [socket, fetchOverview]);

  // Broadcast live GPS location via HTML5 watchPosition
  const pushLiveLocationToServer = useCallback(
    async (coords, accuracyVal = 10, targetRole = user?.role || 'citizen') => {
      const activeIncId = selectedSession?.incidentId;
      try {
        if (targetRole === 'citizen' || clickMode === 'citizen') {
          const res = await axios.post('/api/live-tracking/citizen-location', {
            incidentId: activeIncId,
            coordinates: coords,
            accuracy: accuracyVal,
            isSharingLive: true
          });
          if (res.data?.data) {
            setSelectedSession(res.data.data);
          }
        } else if (targetRole === 'volunteer' || clickMode === 'volunteer') {
          const res = await axios.post('/api/live-tracking/unit-location', {
            incidentId: activeIncId,
            unitType: 'volunteer',
            userId: user?._id || user?.id,
            coordinates: coords,
            status: 'EN_ROUTE'
          });
          if (res.data?.data) {
            setSelectedSession(res.data.data);
          }
        } else {
          const res = await axios.post('/api/live-tracking/unit-location', {
            incidentId: activeIncId,
            unitType: 'team',
            coordinates: coords,
            status: 'EN_ROUTE'
          });
          if (res.data?.data) {
            setSelectedSession(res.data.data);
          }
        }
        setLastGpsPingTime(new Date());
      } catch (err) {
        console.error('[Live Location Push Error]:', err);
      }
    },
    [selectedSession?.incidentId, user, clickMode]
  );

  const toggleLiveGpsBroadcast = () => {
    if (isBroadcastingGps) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcastingGps(false);
      setStatusBanner('Live GPS continuous broadcast paused.');
      return;
    }

    if (!navigator.geolocation) {
      setStatusBanner('Geolocation is not supported by this browser.');
      return;
    }

    setIsBroadcastingGps(true);
    setStatusBanner('Acquiring high-accuracy satellite GPS lock...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [
          Number(pos.coords.longitude.toFixed(5)),
          Number(pos.coords.latitude.toFixed(5))
        ];
        const acc = Math.round(pos.coords.accuracy || 10);
        setMyGpsCoords(coords);
        setGpsAccuracy(acc);
        setStatusBanner(
          `Streaming exact live GPS (${coords[1]}°N, ${coords[0]}°E • ±${acc}m) as ${
            user?.role?.toUpperCase() || 'CITIZEN'
          }`
        );
        pushLiveLocationToServer(coords, acc, user?.role || 'citizen');
      },
      () => {
        // Fallback to simulated live ping around current coordinates if browser blocks GPS
        setStatusBanner(
          `Live GPS Beacon active (Fallback Telemetry Mode • ${myGpsCoords[1].toFixed(
            4
          )}°N, ${myGpsCoords[0].toFixed(4)}°E)`
        );
        pushLiveLocationToServer(myGpsCoords, 12, user?.role || 'citizen');
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, []);

  // Simulate Rescue Team & Volunteer approaching the Citizen's live SOS location
  const handleSimulateStep = useCallback(
    async (reset = false) => {
      if (!selectedSession?.incidentId) return;
      try {
        const res = await axios.post(
          `/api/live-tracking/simulate-step/${selectedSession.incidentId}`,
          { reset }
        );
        if (res.data?.data) {
          setSelectedSession(res.data.data);
          if (
            res.data.data.assignedTeam?.status === 'ON_SCENE' &&
            res.data.data.assignedVolunteer?.status === 'ON_SCENE'
          ) {
            setSimulatingApproach(false);
            if (simIntervalRef.current) clearInterval(simIntervalRef.current);
            setStatusBanner(
              '✅ Assigned Response Team & Field Volunteer have arrived at the Citizen SOS location!'
            );
          }
        }
      } catch (err) {
        console.error('[Simulation Step Error]:', err);
      }
    },
    [selectedSession?.incidentId]
  );

  useEffect(() => {
    if (simulatingApproach && selectedSession?.incidentId) {
      simIntervalRef.current = setInterval(() => {
        handleSimulateStep(false);
      }, 2200);
    } else if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulatingApproach, selectedSession?.incidentId, handleSimulateStep]);

  // Raise Instant Live SOS directly from the Live Tracking Map
  const handleRaiseInstantSos = async () => {
    setCreatingTestSos(true);
    try {
      const startCoords = myGpsCoords || [80.2707, 13.0827];
      const res = await axios.post('/api/citizen/sos', {
        fullName: user?.name || 'Srinath G (Citizen SOS)',
        contactPhone: user?.phone || '+91 98401 23456',
        emergencyType: 'Trapped Civilians',
        peopleCount: 3,
        address: 'Marina Coastal Sector — Live GPS Beacon',
        description: 'Live SOS raised with continuous real-time GPS tracking enabled.',
        coordinates: startCoords,
        accuracy: gpsAccuracy,
        isSharingLive: true
      });
      if (res.data?.success) {
        localStorage.setItem('activeSosIncidentId', res.data.incidentId);
        setSearchParams({ incidentId: res.data.incidentId });
        setStatusBanner(
          `🚨 SOS ${res.data.incidentId} broadcasted! Assigned ${res.data.assignedTeam} & Volunteer ${res.data.assignedVolunteer}.`
        );
        await fetchOverview(res.data.incidentId);
      }
    } catch (err) {
      console.error('[Instant SOS Error]:', err);
    } finally {
      setCreatingTestSos(false);
    }
  };

  // Handle interactive map click to move Citizen, Team, or Volunteer pin
  const handleMapPickCoordinates = async (coords) => {
    if (!clickMode) return;
    if (clickMode === 'citizen') {
      await pushLiveLocationToServer(coords, 8, 'citizen');
      setStatusBanner(`Updated Citizen Live SOS Pin to ${coords[1]}°N, ${coords[0]}°E`);
    } else if (clickMode === 'volunteer') {
      await pushLiveLocationToServer(coords, 8, 'volunteer');
      setStatusBanner(`Updated Assigned Volunteer Live Pin to ${coords[1]}°N, ${coords[0]}°E`);
    } else if (clickMode === 'team') {
      await pushLiveLocationToServer(coords, 8, 'responder');
      setStatusBanner(`Updated Assigned Response Team Live Pin to ${coords[1]}°N, ${coords[0]}°E`);
    }
    setClickMode(null);
  };

  // Coordinates for Leaflet (Leaflet uses [lat, lng], GeoJSON uses [lng, lat])
  const citizenCoords = selectedSession?.citizenLiveLocation?.coordinates || [80.2707, 13.0827];
  const citizenLatLng = [citizenCoords[1], citizenCoords[0]];

  const teamCoords = selectedSession?.assignedTeam?.coordinates || [80.255, 13.092];
  const teamLatLng = [teamCoords[1], teamCoords[0]];

  const volunteerCoords = selectedSession?.assignedVolunteer?.coordinates || [80.2625, 13.0745];
  const volunteerLatLng = [volunteerCoords[1], volunteerCoords[0]];

  // Rescue progress stage calculation (1 to 4)
  const getRescueStage = () => {
    if (!selectedSession) return 1;
    if (
      selectedSession.assignedTeam?.status === 'ON_SCENE' ||
      selectedSession.assignedVolunteer?.status === 'ON_SCENE' ||
      selectedSession.assignedTeam?.distanceKm <= 0.1
    ) {
      return 4;
    }
    if (
      selectedSession.assignedTeam?.distanceKm < 1.8 ||
      selectedSession.assignedVolunteer?.distanceKm < 1.2
    ) {
      return 3;
    }
    return 2;
  };

  const currentStage = getRescueStage();

  return (
    <div className="space-y-5 pb-10">
      {/* TOP HEADER & LIVE TELEMETRY ACTION BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#0F172A] via-[#131D31] to-[#0F172A] p-5 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-300 font-mono">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              REAL-TIME GPS TELEMETRY
            </span>
            {selectedSession && (
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-0.5 text-[11px] font-bold text-cyan-300 font-mono">
                ACTIVE TRACKING ID: {selectedSession.incidentId}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-mono">
            Live SOS, Response Team & Volunteer Tracker
          </h1>
          <p className="text-xs text-slate-300">
            Track exact live GPS coordinates of Citizens in distress, approaching NDRF Response Teams, and Field Volunteers on a dedicated tactical map.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={toggleLiveGpsBroadcast}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold uppercase font-mono transition shadow-lg ${
              isBroadcastingGps
                ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-emerald-950/50 animate-pulse'
                : 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
            }`}
          >
            <Crosshair className={`h-4 w-4 ${isBroadcastingGps ? 'animate-spin' : ''}`} />
            <span>
              {isBroadcastingGps ? 'Streaming My Live GPS (Stop)' : 'Share My Exact Live GPS'}
            </span>
          </button>

          <button
            onClick={() => setSimulatingApproach((prev) => !prev)}
            disabled={!selectedSession}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold uppercase font-mono transition shadow-lg disabled:opacity-50 ${
              simulatingApproach
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                : 'border-blue-500/40 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
            }`}
            title="Watch the assigned Response Team and Volunteer move live toward the Citizen SOS location"
          >
            {simulatingApproach ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{simulatingApproach ? 'Pause Live Approach' : 'Simulate Rescue Approach'}</span>
          </button>

          <button
            onClick={() => {
              setSimulatingApproach(false);
              handleSimulateStep(true);
            }}
            disabled={!selectedSession}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2.5 text-xs font-bold uppercase font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition disabled:opacity-50"
            title="Reset Response Team and Volunteer positions to starting dispatch points"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Route</span>
          </button>

          <button
            onClick={handleRaiseInstantSos}
            disabled={creatingTestSos}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-3.5 py-2.5 text-xs font-black uppercase font-mono text-rose-300 shadow-lg hover:bg-rose-500/30 transition disabled:opacity-50"
          >
            <AlertOctagon className="h-4 w-4" />
            <span>{creatingTestSos ? 'Launching...' : '+ Raise Live SOS'}</span>
          </button>
        </div>
      </div>

      {/* STATUS BANNER */}
      {statusBanner && (
        <div className="flex items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-xs text-cyan-300 font-mono">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
            <span>{statusBanner}</span>
          </div>
          <button
            onClick={() => setStatusBanner('')}
            className="text-[10px] text-slate-400 hover:text-white uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4-STEP LIVE RESCUE PROGRESS TRACKER (FOR CITIZEN & COMMAND VISIBILITY) */}
      {selectedSession && (
        <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Live Rescue Dispatch Timeline — {selectedSession.reporterName} ({selectedSession.incidentId})
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-300">
                🚒 Team ETA:{' '}
                <strong>
                  {selectedSession.assignedTeam?.etaMinutes === 0
                    ? 'ARRIVED ON SCENE'
                    : `${selectedSession.assignedTeam?.etaMinutes} mins (${selectedSession.assignedTeam?.distanceKm} km)`}
                </strong>
              </span>
              <span className="text-emerald-300">
                🦺 Volunteer ETA:{' '}
                <strong>
                  {selectedSession.assignedVolunteer?.etaMinutes === 0
                    ? 'ARRIVED ON SCENE'
                    : `${selectedSession.assignedVolunteer?.etaMinutes} mins (${selectedSession.assignedVolunteer?.distanceKm} km)`}
                </strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                step: 1,
                title: '1. SOS & Live GPS Locked',
                desc: `${citizenLatLng[0].toFixed(4)}°N, ${citizenLatLng[1].toFixed(4)}°E (±${
                  selectedSession.citizenLiveLocation?.accuracy || 10
                }m)`
              },
              {
                step: 2,
                title: '2. Units Dispatched',
                desc: `${selectedSession.assignedTeam?.name} & ${selectedSession.assignedVolunteer?.name}`
              },
              {
                step: 3,
                title: '3. Approaching Citizen',
                desc: `Team ${selectedSession.assignedTeam?.distanceKm} km • Volunteer ${selectedSession.assignedVolunteer?.distanceKm} km`
              },
              {
                step: 4,
                title: '4. On Scene / Rescue',
                desc:
                  currentStage >= 4
                    ? 'Units have reached citizen coordinates!'
                    : 'Live GPS corridor locked until arrival'
              }
            ].map((item) => {
              const active = currentStage >= item.step;
              return (
                <div
                  key={item.step}
                  className={`rounded-xl border p-3 transition-all ${
                    active
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-extrabold uppercase font-mono">
                      {item.title}
                    </span>
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        active ? 'text-emerald-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN GRID: DEDICATED LIVE TRACKING MAP (LEFT 8 COLS) + TELEMETRY CARDS (RIGHT 4 COLS) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* DEDICATED MAP COLUMN */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-800 bg-[#131D31] overflow-hidden shadow-2xl">
          {/* Map Top Filter & Interactive Pin Placement Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-4 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Live Layers' },
                { id: 'citizen', label: '🚨 Citizen SOS' },
                { id: 'teams', label: '🚒 Response Teams' },
                { id: 'volunteers', label: '🦺 Volunteers' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLayerFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-mono transition ${
                    layerFilter === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Map Click Relocation Controls */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-400 hidden sm:inline">Move Pin on Map:</span>
              {[
                { mode: 'citizen', label: '📍 Citizen', color: 'rose' },
                { mode: 'team', label: '🚒 Team', color: 'cyan' },
                { mode: 'volunteer', label: '🦺 Volunteer', color: 'emerald' }
              ].map((btn) => (
                <button
                  key={btn.mode}
                  onClick={() =>
                    setClickMode((prev) => (prev === btn.mode ? null : btn.mode))
                  }
                  className={`rounded-lg border px-2 py-1 font-bold transition ${
                    clickMode === btn.mode
                      ? 'border-amber-400 bg-amber-500/25 text-amber-200 animate-pulse'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                  }`}
                  title={`Click here, then click anywhere on the map to update the ${btn.mode}'s live GPS coordinates`}
                >
                  {clickMode === btn.mode ? `Click Map (${btn.label})...` : btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="relative h-[500px] sm:h-[580px] w-full">
            {/* Top-left floating route distance/ETA HUD pill so labels never overlap markers */}
            {selectedSession && (
              <div className="absolute top-3 left-14 z-[400] flex flex-wrap items-center gap-2 pointer-events-none">
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-[11px] font-mono font-bold text-rose-300 shadow-lg backdrop-blur-md">
                  🚨 SOS: {selectedSession.reporterName}
                </div>
                <div className="rounded-lg border border-blue-500/40 bg-blue-500/15 px-2.5 py-1 text-[11px] font-mono font-bold text-blue-300 shadow-lg backdrop-blur-md">
                  🚒 Team: {selectedSession.assignedTeam?.distanceKm} km (ETA {selectedSession.assignedTeam?.etaMinutes}m)
                </div>
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-300 shadow-lg backdrop-blur-md">
                  🦺 Volunteer: {selectedSession.assignedVolunteer?.distanceKm} km (ETA {selectedSession.assignedVolunteer?.etaMinutes}m)
                </div>
              </div>
            )}

            {/* Top-right Street / Satellite / Dark Map Mode Switcher */}
            <div className="absolute top-3 right-3 z-[400] flex items-center gap-1 rounded-xl border border-slate-700 bg-[#0F172A]/95 p-1 shadow-xl backdrop-blur-md">
              {[
                { id: 'osm', label: 'Street' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'dark', label: 'Dark' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTileStyle(m.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold font-mono transition ${
                    tileStyle === m.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <MapContainer
              center={citizenLatLng}
              zoom={14}
              style={{ height: '100%', width: '100%', background: '#0B1120' }}
            >
              {/* 100% Free, No API Key, No Watermark Map Tiles */}
              {tileStyle === 'satellite' ? (
                <TileLayer
                  key="satellite"
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                  minZoom={2}
                />
              ) : (
                <TileLayer
                  key={tileStyle}
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  className={tileStyle === 'dark' ? 'tactical-dark-tiles' : ''}
                  maxZoom={19}
                  minZoom={2}
                />
              )}

              <MapViewUpdater center={citizenLatLng} />
              <MapClickPinMover
                enabled={Boolean(clickMode)}
                onPickCoordinates={handleMapPickCoordinates}
              />

              {/* 1. CITIZEN SOS LIVE LOCATION MARKER & GPS ACCURACY RING */}
              {selectedSession &&
                (layerFilter === 'all' || layerFilter === 'citizen') && (
                  <>
                    <Circle
                      center={citizenLatLng}
                      radius={Math.max(
                        65,
                        (selectedSession.citizenLiveLocation?.accuracy || 12) * 8
                      )}
                      pathOptions={{
                        color: '#f43f5e',
                        fillColor: '#f43f5e',
                        fillOpacity: 0.14,
                        weight: 1.5,
                        dashArray: '4 4'
                      }}
                    />

                    <Marker position={citizenLatLng} icon={createCitizenSosIcon()}>
                      <Tooltip
                        direction="top"
                        offset={[0, -20]}
                        className="font-mono text-xs font-bold"
                      >
                        🚨 CITIZEN SOS: {selectedSession.reporterName} (LIVE GPS)
                      </Tooltip>
                      <Popup>
                        <div className="space-y-1.5 text-xs font-sans min-w-[210px]">
                          <div className="font-bold text-rose-600 uppercase">
                            🚨 CITIZEN SOS LIVE BEACON ({selectedSession.incidentId})
                          </div>
                          <div>
                            <strong>Citizen:</strong> {selectedSession.reporterName}
                          </div>
                          <div>
                            <strong>Phone:</strong> {selectedSession.reporterPhone || '1070'}
                          </div>
                          <div>
                            <strong>Emergency:</strong> {selectedSession.emergencyType} (
                            {selectedSession.victimCount} people)
                          </div>
                          <div>
                            <strong>Live GPS:</strong> {citizenLatLng[0].toFixed(5)}°N,{' '}
                            {citizenLatLng[1].toFixed(5)}°E
                          </div>
                          <div>
                            <strong>GPS Accuracy:</strong> ±
                            {selectedSession.citizenLiveLocation?.accuracy || 10}m
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}

              {/* 2. ASSIGNED RESPONSE TEAM LIVE MARKER & ROUTE POLYLINE */}
              {selectedSession &&
                (layerFilter === 'all' || layerFilter === 'teams') && (
                  <>
                    <Polyline
                      positions={[teamLatLng, citizenLatLng]}
                      pathOptions={{
                        color: '#38bdf8',
                        weight: 4,
                        dashArray: '10, 8',
                        opacity: 0.95
                      }}
                    >
                      <Tooltip sticky>
                        🚒 Team Route: {selectedSession.assignedTeam?.distanceKm} km (ETA{' '}
                        {selectedSession.assignedTeam?.etaMinutes}m)
                      </Tooltip>
                    </Polyline>

                    <Marker
                      position={teamLatLng}
                      icon={createResponseTeamIcon(true)}
                    >
                      <Tooltip direction="top" offset={[0, -18]}>
                        🚒 {selectedSession.assignedTeam?.name} (
                        {selectedSession.assignedTeam?.status}) • {selectedSession.assignedTeam?.distanceKm} km
                      </Tooltip>
                      <Popup>
                        <div className="space-y-1.5 text-xs font-sans min-w-[210px]">
                          <div className="font-bold text-sky-700 uppercase">
                            🚒 ASSIGNED RESPONSE TEAM
                          </div>
                          <div>
                            <strong>Unit:</strong> {selectedSession.assignedTeam?.name}
                          </div>
                          <div>
                            <strong>Commander:</strong>{' '}
                            {selectedSession.assignedTeam?.leaderName}
                          </div>
                          <div>
                            <strong>Vehicle:</strong>{' '}
                            {selectedSession.assignedTeam?.vehiclePlate} (
                            {selectedSession.assignedTeam?.vehicleType})
                          </div>
                          <div>
                            <strong>Contact:</strong>{' '}
                            {selectedSession.assignedTeam?.contactPhone}
                          </div>
                          <div>
                            <strong>Distance to Citizen:</strong>{' '}
                            {selectedSession.assignedTeam?.distanceKm} km (
                            {selectedSession.assignedTeam?.distanceMeters} m)
                          </div>
                          <div>
                            <strong>Estimated Arrival:</strong>{' '}
                            {selectedSession.assignedTeam?.etaMinutes === 0
                              ? 'ON SCENE'
                              : `${selectedSession.assignedTeam?.etaMinutes} mins`}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}

              {/* 3. ASSIGNED FIELD VOLUNTEER LIVE MARKER & ROUTE POLYLINE */}
              {selectedSession &&
                (layerFilter === 'all' || layerFilter === 'volunteers') && (
                  <>
                    <Polyline
                      positions={[volunteerLatLng, citizenLatLng]}
                      pathOptions={{
                        color: '#10b981',
                        weight: 4,
                        dashArray: '8, 8',
                        opacity: 0.95
                      }}
                    >
                      <Tooltip sticky>
                        🦺 Volunteer Route: {selectedSession.assignedVolunteer?.distanceKm} km
                        (ETA {selectedSession.assignedVolunteer?.etaMinutes}m)
                      </Tooltip>
                    </Polyline>

                    <Marker
                      position={volunteerLatLng}
                      icon={createVolunteerIcon(true)}
                    >
                      <Tooltip direction="bottom" offset={[0, 14]}>
                        🦺 Volunteer: {selectedSession.assignedVolunteer?.name} (
                        {selectedSession.assignedVolunteer?.status}) • {selectedSession.assignedVolunteer?.distanceKm} km
                      </Tooltip>
                      <Popup>
                        <div className="space-y-1.5 text-xs font-sans min-w-[200px]">
                          <div className="font-bold text-emerald-700 uppercase">
                            🦺 ASSIGNED FIELD VOLUNTEER
                          </div>
                          <div>
                            <strong>Name:</strong> {selectedSession.assignedVolunteer?.name}
                          </div>
                          <div>
                            <strong>Phone:</strong> {selectedSession.assignedVolunteer?.phone}
                          </div>
                          <div>
                            <strong>Skills:</strong>{' '}
                            {selectedSession.assignedVolunteer?.skills}
                          </div>
                          <div>
                            <strong>Distance to Citizen:</strong>{' '}
                            {selectedSession.assignedVolunteer?.distanceKm} km (
                            {selectedSession.assignedVolunteer?.distanceMeters} m)
                          </div>
                          <div>
                            <strong>Estimated Arrival:</strong>{' '}
                            {selectedSession.assignedVolunteer?.etaMinutes === 0
                              ? 'ON SCENE'
                              : `${selectedSession.assignedVolunteer?.etaMinutes} mins`}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}

              {/* 4. OTHER FIELD RESPONSE TEAMS ON PATROL */}
              {(layerFilter === 'all' || layerFilter === 'teams') &&
                allTeams
                  .filter(
                    (t) =>
                      t._id !== selectedSession?.assignedTeam?._id &&
                      t.currentLocation?.coordinates?.length === 2
                  )
                  .map((team) => (
                    <Marker
                      key={team._id}
                      position={[
                        team.currentLocation.coordinates[1],
                        team.currentLocation.coordinates[0]
                      ]}
                      icon={createResponseTeamIcon(false)}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-slate-800">
                            🚒 {team.name} ({team.status})
                          </div>
                          <div>Type: {team.type}</div>
                          <div>Leader: {team.leaderName}</div>
                          <div>Phone: {team.contactPhone}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

              {/* 5. OTHER REGISTERED FIELD VOLUNTEERS */}
              {(layerFilter === 'all' || layerFilter === 'volunteers') &&
                allVolunteers
                  .filter((v) => v.coordinates?.length === 2)
                  .map((vol) => (
                    <Marker
                      key={vol._id}
                      position={[vol.coordinates[1], vol.coordinates[0]]}
                      icon={createVolunteerIcon(false)}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-emerald-800">
                            🦺 Field Volunteer: {vol.name}
                          </div>
                          <div>Phone: {vol.phone}</div>
                          <div>
                            Skills:{' '}
                            {Array.isArray(vol.skills)
                              ? vol.skills.join(', ')
                              : vol.skills}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[400] rounded-xl border border-slate-700/90 bg-[#0F172A]/95 p-3 text-[11px] font-mono text-slate-200 shadow-2xl backdrop-blur-md space-y-1.5">
              <div className="font-bold uppercase text-cyan-400 text-[10px] tracking-wider">
                Live Telemetry Legend
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-rose-600 border border-white" />
                <span>Citizen SOS Live GPS Beacon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded bg-sky-600 border border-white" />
                <span>Assigned Response Team (Live Route)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-600 border border-white" />
                <span>Assigned Field Volunteer (Live Route)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT TELEMETRY DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. CITIZEN SOS LIVE LOCATION CARD */}
          {selectedSession ? (
            <>
              <div className="rounded-2xl border border-rose-500/40 bg-[#131D31] p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 font-bold text-xs">
                      🚨
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase text-white font-mono">
                        Citizen Live SOS Beacon
                      </h3>
                      <p className="text-[11px] text-rose-300 font-mono">
                        {selectedSession.incidentId} • {selectedSession.emergencyType}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 font-mono animate-pulse">
                    LIVE GPS ON
                  </span>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Citizen Name:</span>
                    <strong className="text-white">{selectedSession.reporterName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Phone:</span>
                    <a
                      href={`tel:${selectedSession.reporterPhone || '1070'}`}
                      className="text-cyan-400 font-bold underline"
                    >
                      {selectedSession.reporterPhone || '+91 98401 23456'}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">People Affected:</span>
                    <strong className="text-amber-300">
                      {selectedSession.victimCount} Person(s)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exact Coordinates:</span>
                    <strong className="text-emerald-300">
                      {citizenLatLng[0].toFixed(5)}°N, {citizenLatLng[1].toFixed(5)}°E
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Lock Accuracy:</span>
                    <span className="text-slate-200">
                      ±{selectedSession.citizenLiveLocation?.accuracy || 10} meters
                    </span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-300 border-t border-slate-800/80">
                    <strong className="text-slate-400">Location:</strong>{' '}
                    {selectedSession.address}
                  </div>
                </div>
              </div>

              {/* 2. ASSIGNED RESPONSE TEAM LIVE CARD */}
              <div className="rounded-2xl border border-sky-500/40 bg-[#131D31] p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 text-sm">
                      🚒
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase text-white font-mono">
                        Assigned Response Team
                      </h3>
                      <p className="text-[11px] text-sky-300 font-mono">
                        {selectedSession.assignedTeam?.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono border ${
                      selectedSession.assignedTeam?.status === 'ON_SCENE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    {selectedSession.assignedTeam?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/90 p-3 text-center font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Live Distance
                    </span>
                    <strong className="text-base font-black text-sky-300">
                      {selectedSession.assignedTeam?.distanceKm} km
                    </strong>
                    <span className="block text-[10px] text-slate-500">
                      ({selectedSession.assignedTeam?.distanceMeters} meters)
                    </span>
                  </div>
                  <div className="border-l border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Estimated Arrival
                    </span>
                    <strong className="text-base font-black text-amber-300">
                      {selectedSession.assignedTeam?.etaMinutes === 0
                        ? 'ARRIVED'
                        : `${selectedSession.assignedTeam?.etaMinutes} min`}
                    </strong>
                    <span className="block text-[10px] text-slate-500">
                      Live Corridor
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unit Commander:</span>
                    <strong className="text-white">
                      {selectedSession.assignedTeam?.leaderName}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rescue Vehicle:</span>
                    <span className="text-cyan-300 font-bold">
                      {selectedSession.assignedTeam?.vehiclePlate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Live Coordinates:</span>
                    <span className="text-slate-200">
                      {teamLatLng[0].toFixed(4)}°N, {teamLatLng[1].toFixed(4)}°E
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${selectedSession.assignedTeam?.contactPhone || '1070'}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 py-2 text-xs font-bold uppercase font-mono text-sky-300 hover:bg-sky-500/25 transition"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>
                    Call Response Team ({selectedSession.assignedTeam?.contactPhone})
                  </span>
                </a>
              </div>

              {/* 3. ASSIGNED FIELD VOLUNTEER LIVE CARD */}
              <div className="rounded-2xl border border-emerald-500/40 bg-[#131D31] p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
                      🦺
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase text-white font-mono">
                        Assigned Field Volunteer
                      </h3>
                      <p className="text-[11px] text-emerald-300 font-mono">
                        {selectedSession.assignedVolunteer?.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono border ${
                      selectedSession.assignedVolunteer?.status === 'ON_SCENE'
                        ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {selectedSession.assignedVolunteer?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/90 p-3 text-center font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Live Distance
                    </span>
                    <strong className="text-base font-black text-emerald-300">
                      {selectedSession.assignedVolunteer?.distanceKm} km
                    </strong>
                    <span className="block text-[10px] text-slate-500">
                      ({selectedSession.assignedVolunteer?.distanceMeters} meters)
                    </span>
                  </div>
                  <div className="border-l border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block">
                      Estimated Arrival
                    </span>
                    <strong className="text-base font-black text-amber-300">
                      {selectedSession.assignedVolunteer?.etaMinutes === 0
                        ? 'ARRIVED'
                        : `${selectedSession.assignedVolunteer?.etaMinutes} min`}
                    </strong>
                    <span className="block text-[10px] text-slate-500">
                      First Responder
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specialties:</span>
                    <span className="text-slate-200 text-right">
                      {selectedSession.assignedVolunteer?.skills}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Live Coordinates:</span>
                    <span className="text-slate-200">
                      {volunteerLatLng[0].toFixed(4)}°N, {volunteerLatLng[1].toFixed(4)}°E
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${selectedSession.assignedVolunteer?.phone || '1070'}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-2 text-xs font-bold uppercase font-mono text-emerald-300 hover:bg-emerald-500/25 transition"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>
                    Call Volunteer ({selectedSession.assignedVolunteer?.phone})
                  </span>
                </a>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-6 text-center space-y-3">
              <AlertOctagon className="h-10 w-10 text-rose-400 mx-auto" />
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                No Active SOS Selected
              </h3>
              <p className="text-xs text-slate-400">
                Click <strong>"+ Raise Live SOS"</strong> above or raise an SOS from the Citizen Portal to start real-time citizen, response team, and volunteer tracking.
              </p>
            </div>
          )}

          {/* 4. ACTIVE SOS SESSIONS SWITCHER */}
          <div className="rounded-2xl border border-slate-800 bg-[#131D31] p-4 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase text-slate-300 font-mono">
                Active SOS Tracking Sessions ({sessions.length})
              </span>
              {lastGpsPingTime && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  Synced {lastGpsPingTime.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {sessions.map((sess) => {
                const isSelected = selectedSession?.incidentId === sess.incidentId;
                return (
                  <button
                    key={sess.incidentId}
                    onClick={() => {
                      setSelectedSession(sess);
                      setSearchParams({ incidentId: sess.incidentId });
                    }}
                    className={`w-full rounded-xl border p-2.5 text-left text-xs font-mono transition ${
                      isSelected
                        ? 'border-cyan-500/50 bg-cyan-500/15 text-white'
                        : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{sess.incidentId}</span>
                      <span className="text-[10px] text-cyan-300">
                        Team: {sess.assignedTeam?.distanceKm} km • Vol:{' '}
                        {sess.assignedVolunteer?.distanceKm} km
                      </span>
                    </div>
                    <div className="font-semibold text-white truncate mt-0.5">
                      {sess.reporterName} — {sess.emergencyType}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {sess.address}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingPage;
