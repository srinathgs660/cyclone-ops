import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { 
  Navigation, Shield, ShieldCheck, Truck, AlertTriangle, CheckCircle, 
  Clock, Plus, X, Layers, Compass, ArrowRight, Eye, Phone, MapPin, 
  Fuel, Activity, Users, AlertOctagon, RotateCw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

// Helper component to center map on selection or overview
const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();
  const prevCenter = React.useRef(null);
  const prevBounds = React.useRef(null);
  const prevZoom = React.useRef(null);

  useEffect(() => {
    if (map && map.scrollWheelZoom) {
      map.scrollWheelZoom.enable();
    }
  }, [map]);

  useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length === 2) {
      const boundsStr = JSON.stringify(bounds);
      if (boundsStr !== prevBounds.current) {
        prevBounds.current = boundsStr;
        map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
      }
    } else if (center && Array.isArray(center)) {
      const centerStr = `${center[0]},${center[1]}`;
      if (centerStr !== prevCenter.current || (zoom && zoom !== prevZoom.current)) {
        prevCenter.current = centerStr;
        prevZoom.current = zoom;
        map.flyTo(center, zoom || 8, { duration: 1.2 });
      }
    }
  }, [center, zoom, bounds, map]);
  return null;
};

// Custom SVG / HTML Leaflet Markers
const shelterIcon = L.divIcon({
  html: `
    <div style="background: #10B981; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.5); cursor: pointer; transition: transform 0.2s;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `,
  className: 'shelter-map-icon',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18]
});

const waypointIcon = (letter) => L.divIcon({
  html: `
    <div style="background: #2563EB; color: white; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; font-family: monospace; box-shadow: 0 4px 12px rgba(37,99,235,0.45); cursor: pointer;">
      ${letter}
    </div>
  `,
  className: 'waypoint-map-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -18]
});

const highRiskIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(249, 115, 22, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="background: #F97316; color: white; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); z-index: 2; cursor: pointer;">
        ⚠️
      </div>
    </div>
  `,
  className: 'hazard-map-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20]
});

const blockedIcon = L.divIcon({
  html: `
    <div style="background: #EF4444; color: white; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; box-shadow: 0 4px 12px rgba(239,68,68,0.5); cursor: pointer;">
      ⛔
    </div>
  `,
  className: 'blocked-map-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18]
});

// Default Mock/Visual Dataset perfectly aligned with Tamil Nadu geography & screenshot
const INITIAL_ROUTES = [
  {
    id: 'route-a',
    code: 'Route A',
    title: 'Route A',
    from: 'Chennai',
    to: 'Vellore',
    distanceKm: 130,
    status: 'Open', // 'Open' | 'Partial' | 'Blocked'
    estimatedTime: '2h 15m',
    color: '#2563EB',
    dashArray: null,
    riskLevel: 'Low',
    capacity: '45,000 evacuees/day',
    path: [
      [13.0827, 80.2707], // Chennai
      [13.0120, 80.1250], // Porur
      [12.9675, 79.9404], // Sriperumbudur
      [12.8342, 79.7036], // Kanchipuram bypass
      [12.9272, 79.3820], // Walajapet
      [12.9165, 79.1325]  // Vellore
    ],
    bottleneck: 'Minor slowdown at Sriperumbudur toll plaza',
    assignedConvoy: 'Convoy TN-Alpha (40 State Buses)',
    shelterDestination: 'Vellore Engineering Relief Complex'
  },
  {
    id: 'route-b',
    code: 'Route B',
    title: 'Route B',
    from: 'Cuddalore',
    to: 'Trichy',
    distanceKm: 180,
    status: 'Open',
    estimatedTime: '3h 10m',
    color: '#2563EB',
    dashArray: null,
    riskLevel: 'Low',
    capacity: '38,000 evacuees/day',
    path: [
      [11.7480, 79.7714], // Cuddalore
      [11.7709, 79.5540], // Panruti
      [11.5997, 79.4862], // Neyveli
      [11.5173, 79.3243], // Vriddhachalam
      [11.3850, 79.0520], // Veppur
      [11.2342, 78.8820], // Perambalur
      [10.7905, 78.7047]  // Trichy
    ],
    bottleneck: 'Clear 4-lane expressway via NH-38',
    assignedConvoy: 'Convoy NDRF-04 (16 High-Clearance Trucks)',
    shelterDestination: 'Trichy Central Disaster Refuge'
  },
  {
    id: 'route-c',
    code: 'Route C',
    title: 'Route C',
    from: 'Nagapattinam',
    to: 'Thanjavur',
    distanceKm: 95,
    status: 'Partial',
    estimatedTime: '2h 30m (Heavy rain delay)',
    color: '#F59E0B',
    dashArray: '6, 6',
    riskLevel: 'Medium',
    capacity: '20,000 evacuees/day',
    path: [
      [10.7672, 79.8427], // Nagapattinam
      [10.7180, 79.7340], // Kilvelur
      [10.7725, 79.6366], // Tiruvarur
      [10.7690, 79.5240], // Koradacheri
      [10.7686, 79.4189], // Needamangalam
      [10.7870, 79.1378]  // Thanjavur
    ],
    bottleneck: 'Waterlogging reported near Tiruvarur; speed restricted to 30 km/h',
    assignedConvoy: 'Convoy MED-108 (22 Ambulances & Triage Vans)',
    shelterDestination: 'Thanjavur Polytechnic Shelter Base'
  },
  {
    id: 'route-d',
    code: 'Route D',
    title: 'Route D',
    from: 'Puducherry',
    to: 'Villupuram',
    distanceKm: 100,
    status: 'Open',
    estimatedTime: '1h 45m',
    color: '#10B981',
    dashArray: null,
    riskLevel: 'Low',
    capacity: '28,000 evacuees/day',
    path: [
      [11.9416, 79.8083], // Puducherry
      [11.9160, 79.7540], // Villianur
      [11.9328, 79.6241], // Valavanur
      [11.9401, 79.4861]  // Villupuram
    ],
    bottleneck: 'Continuous coastal patrol active; smooth transit',
    assignedConvoy: 'Convoy PR-02 (28 Mini-Buses & Government Transits)',
    shelterDestination: 'Villupuram Multi-Purpose Safe Haven'
  },
  {
    id: 'route-e',
    code: 'Route E',
    title: 'Route E',
    from: 'Rameswaram',
    to: 'Madurai',
    distanceKm: 175,
    status: 'Blocked',
    estimatedTime: 'Suspended (Storm Surge)',
    color: '#EF4444',
    dashArray: '8, 8',
    riskLevel: 'Severe',
    capacity: '0 evacuees (Route Closed)',
    path: [
      [9.2876, 79.3129], // Rameswaram
      [9.2810, 79.2000], // Pamban Bridge
      [9.2780, 79.1240], // Mandapam
      [9.3639, 78.8395], // Ramanathapuram
      [9.5447, 78.5898], // Paramakudi
      [9.6970, 78.4480], // Manamadurai
      [9.9252, 78.1198]  // Madurai
    ],
    bottleneck: 'Pamban Causeway submerged under 3.5m surge waves. Traffic diverted to rail relief.',
    assignedConvoy: 'Coast Guard Amphibious Squad on Standby',
    shelterDestination: 'Madurai Indoor Stadium Evac Center'
  }
];

const SAFE_SHELTERS = [
  {
    id: 'sh-1',
    name: 'Vellore Engineering Relief Hub',
    district: 'Vellore',
    coords: [12.9165, 79.1325],
    capacity: 3500,
    occupied: 1420,
    distanceFromCoast: '130 km inland (Ultra Safe)',
    supplies: { water: '18,000 L', food: '6,200 Meals', medicalKits: 140, powerBackup: '100% Dual Genset' },
    contact: '+91 416 224 5500',
    manager: 'Dr. S. Ramanathan'
  },
  {
    id: 'sh-2',
    name: 'Trichy Central Disaster Refuge',
    district: 'Tiruchirappalli',
    coords: [10.7905, 78.7047],
    capacity: 4000,
    occupied: 2150,
    distanceFromCoast: '180 km inland (Ultra Safe)',
    supplies: { water: '25,000 L', food: '9,500 Meals', medicalKits: 220, powerBackup: '100% Industrial Generator' },
    contact: '+91 431 241 1234',
    manager: 'Capt. Vijayalakshmi'
  },
  {
    id: 'sh-3',
    name: 'Thanjavur Polytechnic Shelter Base',
    district: 'Thanjavur',
    coords: [10.7870, 79.1378],
    capacity: 2200,
    occupied: 1680,
    distanceFromCoast: '95 km inland (Safe Elevation)',
    supplies: { water: '12,000 L', food: '4,000 Meals', medicalKits: 85, powerBackup: 'Active Solar & Genset' },
    contact: '+91 4362 277 889',
    manager: 'Er. Muthuvel'
  },
  {
    id: 'sh-4',
    name: 'Villupuram Multi-Purpose Safe Haven',
    district: 'Villupuram',
    coords: [11.9401, 79.4861],
    capacity: 2800,
    occupied: 950,
    distanceFromCoast: '100 km inland (Safe)',
    supplies: { water: '15,000 L', food: '5,500 Meals', medicalKits: 110, powerBackup: 'Operational' },
    contact: '+91 4146 222 345',
    manager: 'Mrs. Jayanthi R.'
  },
  {
    id: 'sh-5',
    name: 'Madurai Indoor Stadium Evac Center',
    district: 'Madurai',
    coords: [9.9252, 78.1198],
    capacity: 5000,
    occupied: 800,
    distanceFromCoast: '175 km inland (Safe Valley)',
    supplies: { water: '30,000 L', food: '12,000 Meals', medicalKits: 300, powerBackup: 'Dedicated Grid Substation' },
    contact: '+91 452 253 0123',
    manager: 'Col. K. Sivakumar'
  }
];

const HIGH_RISK_ZONES = [
  {
    id: 'risk-1',
    name: 'Nagapattinam Coastal Surge Zone',
    coords: [10.7672, 79.8427],
    threat: 'Direct Eye Landfall Corridor • 4.2m Storm Surge Tide Warning',
    evacPriority: 'Critical (Phase 1)',
    populationAtRisk: 64000
  },
  {
    id: 'risk-2',
    name: 'Cuddalore Lowland Fishermen Sector',
    coords: [11.7480, 79.7714],
    threat: 'Uppanar River Flood Backwash • 135 km/h Cyclone Wind Field',
    evacPriority: 'High (Immediate Relocation)',
    populationAtRisk: 52000
  },
  {
    id: 'risk-3',
    name: 'Puducherry Port Seafront Sector',
    coords: [11.9416, 79.8083],
    threat: 'Harbor Seawall Overwash • High Wave Activity (6.5m crests)',
    evacPriority: 'High',
    populationAtRisk: 41000
  }
];

const TRANSPORT_FLEETS = [
  {
    id: 'fleet-1',
    name: 'State Transport Evacuation Fleet (SETC TN-Alpha)',
    vehicleType: 'Heavy Commercial Evacuation Buses (40 Units)',
    capacity: 2000,
    assignedRoute: 'Route A (Chennai ➔ Vellore)',
    status: 'Active Shuttling',
    fuelLevel: '95%',
    convoyCommander: 'M. Senthil Nathan',
    contact: '+91 94440 12345'
  },
  {
    id: 'fleet-2',
    name: 'NDRF Amphibious High-Clearance Battalions (Convoy NDRF-04)',
    vehicleType: 'Tactical All-Terrain 6x6 Heavy Trucks (16 Units)',
    capacity: 640,
    assignedRoute: 'Route B (Cuddalore ➔ Trichy)',
    status: 'Staged at Origin',
    fuelLevel: '100%',
    convoyCommander: 'Inspector R. Chettiar',
    contact: '+91 94440 67890'
  },
  {
    id: 'fleet-3',
    name: 'Emergency Medical Triage Squad (Convoy MED-108)',
    vehicleType: 'Advanced Life Support Ambulances (22 Units)',
    capacity: 88,
    assignedRoute: 'Route C (Nagapattinam ➔ Thanjavur)',
    status: 'Cautious Transit / Heavy Rain',
    fuelLevel: '85%',
    convoyCommander: 'Dr. Archana Das',
    contact: '+91 94440 54321'
  },
  {
    id: 'fleet-4',
    name: 'Civil Defense Coastal Transit Convoy (PR-02)',
    vehicleType: 'Coordinated Mini-Buses & Vans (28 Units)',
    capacity: 840,
    assignedRoute: 'Route D (Puducherry ➔ Villupuram)',
    status: 'Active Shuttling',
    fuelLevel: '90%',
    convoyCommander: 'S. Loganathan',
    contact: '+91 94440 98765'
  }
];

const EvacuationPlanning = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'officer';
  const { lastUpdated } = useSocket();

  // Top Tabs: 'routes' | 'shelters' | 'transport'
  const [activeTab, setActiveTab] = useState('routes');
  
  // Routes State
  const [routes, setRoutes] = useState(INITIAL_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(INITIAL_ROUTES[0]);

  // Map Tile Style: 'osm' (Street) | 'satellite' | 'dark'
  const [tileStyle, setTileStyle] = useState('osm');

  // Focus coordinates for MapController
  const [mapCenter, setMapCenter] = useState([11.5, 79.2]);
  const [mapZoom, setMapZoom] = useState(7.5);
  const [mapBounds, setMapBounds] = useState(null);

  // Admin Create / Edit Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    zoneName: 'Coastal Sector A - Marina',
    populationRequiringEvacuation: 50000,
    priorityScore: 90,
    routeName: 'Route G - Kanchipuram Inland Bypass',
    from: 'Mahabalipuram',
    to: 'Kanchipuram',
    distanceKm: 65,
    notes: ''
  });

  // Calculate high-level stats
  const totalRoutesCount = routes.length;
  const openRoutesCount = routes.filter(r => r.status === 'Open').length;
  const partialRoutesCount = routes.filter(r => r.status === 'Partial').length;
  const blockedRoutesCount = routes.filter(r => r.status === 'Blocked').length;

  const totalShelterBeds = SAFE_SHELTERS.reduce((acc, s) => acc + s.capacity, 0);
  const totalShelterOccupied = SAFE_SHELTERS.reduce((acc, s) => acc + s.occupied, 0);
  const shelterOccupancyRate = Math.round((totalShelterOccupied / totalShelterBeds) * 100);

  // When selecting a route from the list
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    if (route.path && route.path.length > 0) {
      // Find bounds of the selected polyline
      const lats = route.path.map(p => p[0]);
      const lngs = route.path.map(p => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      setMapBounds([[minLat, minLng], [maxLat, maxLng]]);
    }
  };

  // Center on shelter
  const handleSelectShelter = (shelter) => {
    setMapCenter(shelter.coords);
    setMapZoom(11);
    setMapBounds(null);
  };

  // Reset to full Tamil Nadu coastal corridor view
  const handleResetView = () => {
    setMapBounds([[9.0, 77.3], [13.4, 80.5]]);
  };

  // Admin toggling route status
  const handleToggleRouteStatus = (routeId) => {
    if (!isAdmin) return;
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      const nextStatus = r.status === 'Open' ? 'Partial' : r.status === 'Partial' ? 'Blocked' : 'Open';
      const nextColor = nextStatus === 'Open' ? '#2563EB' : nextStatus === 'Partial' ? '#F59E0B' : '#EF4444';
      const nextDash = nextStatus === 'Blocked' ? '8, 8' : nextStatus === 'Partial' ? '6, 6' : null;
      const updated = { ...r, status: nextStatus, color: nextColor, dashArray: nextDash };
      if (selectedRoute?.id === r.id) setSelectedRoute(updated);
      return updated;
    }));
  };

  // Admin Add Evacuation Plan submission
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!newPlan.title) return;
    setCreating(true);
    try {
      // Add locally to interactive routes
      const newRouteItem = {
        id: `route-${Date.now()}`,
        code: `Route ${String.fromCharCode(65 + routes.length)}`,
        title: `Route ${String.fromCharCode(65 + routes.length)}`,
        from: newPlan.from || 'Coastal Sector',
        to: newPlan.to || 'Inland Hub',
        distanceKm: Number(newPlan.distanceKm || 70),
        status: 'Open',
        estimatedTime: '1h 30m',
        color: '#2563EB',
        dashArray: null,
        riskLevel: 'Low',
        capacity: `${(newPlan.populationRequiringEvacuation || 25000).toLocaleString()} evacuees/day`,
        path: [
          [12.6208, 80.1944], // Mahabalipuram
          [12.7000, 79.9800], // Chengalpattu
          [12.8342, 79.7036]  // Kanchipuram
        ],
        bottleneck: 'Designated rapid emergency evacuation corridor',
        assignedConvoy: 'Civil Defense Squad Active',
        shelterDestination: 'Kanchipuram Safe Shelter'
      };

      setRoutes(prev => [...prev, newRouteItem]);
      setSelectedRoute(newRouteItem);

      // Attempt backend API sync
      try {
        await axios.post('/api/evacuations', {
          title: newPlan.title,
          zoneName: newPlan.zoneName,
          populationRequiringEvacuation: Number(newPlan.populationRequiringEvacuation),
          priorityScore: Number(newPlan.priorityScore),
          routes: [{
            name: newRouteItem.title,
            distanceKm: newRouteItem.distanceKm,
            estimatedDurationMin: 90,
            roadStatus: 'CLEAR'
          }],
          notes: newPlan.notes
        });
      } catch (backendErr) {
        console.warn('[Backend post ignored, local route active]:', backendErr.message);
      }

      setShowCreateModal(false);
      setNewPlan({
        title: '',
        zoneName: 'Coastal Sector A - Marina',
        populationRequiringEvacuation: 50000,
        priorityScore: 90,
        routeName: 'Route G - Kanchipuram Inland Bypass',
        from: 'Mahabalipuram',
        to: 'Kanchipuram',
        distanceKm: 65,
        notes: ''
      });
    } finally {
      setCreating(false);
    }
  };

  // Map Tile URL configuration (100% Free, No API Key, No Watermark)
  const tileConfig = useMemo(() => {
    switch (tileStyle) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Imagery',
          className: ''
        };
      case 'dark':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (Tactical Dark Mode)',
          className: 'tactical-dark-tiles'
        };
      default:
        // Clean OpenStreetMap default as requested in screenshot
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          className: ''
        };
    }
  }, [tileStyle]);

  return (
    <div className="w-full space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ================= MAIN CONTAINER CARD ================= */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-sm light-adapt-box transition-all">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden p-0.5 border border-blue-200 bg-slate-900 shadow-sm">
              <img src="/logo.png" alt="CycloneCommand Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                Evacuation Planning
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage evacuation routes and shelter capacity
              </p>
            </div>
          </div>

          {/* Action / Admin Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleResetView}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              title="Reset Map to Full Corridor"
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Full Corridor</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:brightness-110 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Route Corridor</span>
              </button>
            )}
          </div>
        </div>

        {/* Top 3 Navigation Tabs (Matching exact design of uploaded image) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 py-2">
          {/* Tab 1: Evacuation Routes */}
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-xs ${
              activeTab === 'routes'
                ? 'border-2 border-blue-400 bg-blue-50 text-blue-600 shadow-sm shadow-blue-200/50'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Navigation className="h-4 w-4 text-blue-600" />
            <span>Evacuation Routes</span>
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-mono text-blue-700 font-bold">
              {routes.length}
            </span>
          </button>

          {/* Tab 2: Safe Shelters */}
          <button
            onClick={() => setActiveTab('shelters')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-xs ${
              activeTab === 'shelters'
                ? 'border-2 border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-200/50'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Safe Shelters</span>
            <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-mono text-emerald-800 font-bold">
              {SAFE_SHELTERS.length}
            </span>
          </button>

          {/* Tab 3: Transport Resources */}
          <button
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-xs ${
              activeTab === 'transport'
                ? 'border-2 border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-200/50'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Truck className="h-4 w-4 text-cyan-600" />
            <span>Transport Resources</span>
            <span className="ml-1 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-mono text-cyan-800 font-bold">
              {TRANSPORT_FLEETS.length}
            </span>
          </button>
        </div>

        {/* ================= TWO-COLUMN SPLIT LAYOUT ================= */}
        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          
          {/* ================= LEFT COLUMN: LIST DIRECTORY (5 of 12 cols) ================= */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            
            {/* Section Subheader based on Active Tab */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-mono tracking-tight">
                {activeTab === 'routes' && 'Evacuation Routes'}
                {activeTab === 'shelters' && 'Verified Safe Shelters'}
                {activeTab === 'transport' && 'Emergency Transport Fleets'}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {activeTab === 'routes' && `${openRoutesCount} Open • ${partialRoutesCount} Caution • ${blockedRoutesCount} Blocked`}
                {activeTab === 'shelters' && `${totalShelterOccupied.toLocaleString()} / ${totalShelterBeds.toLocaleString()} Beds (${shelterOccupancyRate}%)`}
                {activeTab === 'transport' && '4 Mobile Fleets Active'}
              </span>
            </div>

            {/* TAB CONTENT 1: EVACUATION ROUTES LIST */}
            {activeTab === 'routes' && (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {routes.map((route) => {
                  const isSelected = selectedRoute?.id === route.id;
                  return (
                    <div
                      key={route.id}
                      onClick={() => handleSelectRoute(route)}
                      className={`group rounded-xl border p-3.5 transition-all cursor-pointer shadow-xs ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-400/20'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Waypoint Icon */}
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-blue-600 border-slate-200 group-hover:border-blue-300'
                          }`}>
                            <Navigation className="h-5 w-5" />
                          </div>

                          {/* Title & Route Points */}
                          <div className="min-w-0">
                            <h3 className="text-sm font-extrabold text-slate-900 font-mono flex items-center gap-2">
                              {route.title}
                              {isSelected && (
                                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                              )}
                            </h3>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              <span className="font-semibold text-slate-700">{route.from}</span>
                              <span className="mx-1 text-slate-400">→</span>
                              <span className="font-semibold text-slate-700">{route.to}</span>
                              <span className="ml-1.5 text-slate-400 font-mono">({route.distanceKm} km)</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge (Open / Partial / Blocked) */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wide border shadow-xs ${
                            route.status === 'Open'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : route.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}>
                            {route.status}
                          </span>

                          {/* Admin Quick Status Switcher */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRouteStatus(route.id);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition"
                              title="Admin: Cycle status (Open/Partial/Blocked)"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Drawer on Selection */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-blue-200/60 text-xs space-y-2 text-slate-600">
                          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                            <div className="rounded-lg bg-white p-2 border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">EST. TRANSIT</span>
                              <strong className="text-slate-800">{route.estimatedTime}</strong>
                            </div>
                            <div className="rounded-lg bg-white p-2 border border-slate-200">
                              <span className="text-slate-400 block text-[10px]">CORRIDOR CAPACITY</span>
                              <strong className="text-slate-800">{route.capacity}</strong>
                            </div>
                          </div>

                          <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-1.5">
                            <AlertTriangle className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                              route.status === 'Open' ? 'text-blue-500' : route.status === 'Partial' ? 'text-amber-500' : 'text-rose-500'
                            }`} />
                            <span><strong>Road Intelligence:</strong> {route.bottleneck}</span>
                          </div>

                          <div className="text-[11px] flex items-center justify-between text-slate-500 font-mono">
                            <span>Relief Depot: <strong className="text-slate-700">{route.shelterDestination}</strong></span>
                            <span className="text-blue-600 font-bold">Highlighted on Map ↑</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT 2: SAFE SHELTERS LIST */}
            {activeTab === 'shelters' && (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {SAFE_SHELTERS.map((sh) => {
                  const percent = Math.round((sh.occupied / sh.capacity) * 100);
                  return (
                    <div
                      key={sh.id}
                      onClick={() => handleSelectShelter(sh)}
                      className="rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-emerald-400 transition cursor-pointer shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 font-mono">{sh.name}</h3>
                            <p className="text-xs text-slate-500">{sh.district} • {sh.distanceFromCoast}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          percent >= 90 ? 'bg-rose-50 text-rose-700 border-rose-300' :
                          percent >= 60 ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}>
                          {percent}% FULL
                        </span>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                          <span>Occupancy</span>
                          <strong>{sh.occupied.toLocaleString()} / {sh.capacity.toLocaleString()} beds</strong>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percent >= 90 ? 'bg-rose-500' : percent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Water: <strong>{sh.supplies.water}</strong></span>
                        <span>Food: <strong>{sh.supplies.food}</strong></span>
                        <span className="text-emerald-600 font-bold hover:underline">Locate on Map →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT 3: TRANSPORT RESOURCES LIST */}
            {activeTab === 'transport' && (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {TRANSPORT_FLEETS.map((fl) => (
                  <div
                    key={fl.id}
                    className="rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-cyan-400 transition shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 font-mono">{fl.name}</h3>
                          <p className="text-xs text-slate-500">{fl.vehicleType}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {fl.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">CORRIDOR</span>
                        <strong className="text-slate-800 truncate block">{fl.assignedRoute}</strong>
                      </div>
                      <div className="p-2 rounded bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">EVAC CAPACITY</span>
                        <strong className="text-slate-800">{fl.capacity} passengers</strong>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Fuel Reserve: <strong className="text-emerald-600">{fl.fuelLevel}</strong></span>
                      <span>Commander: <strong className="text-slate-700">{fl.convoyCommander}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE LEAFLET MAP (7 of 12 cols) ================= */}
          <div className="lg:col-span-7 relative min-h-[580px] h-[640px] rounded-2xl overflow-hidden border border-slate-300 shadow-md">
            
            {/* Leaflet Map Container */}
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', minHeight: '580px', zIndex: 1 }}
            >
              <MapController center={mapCenter} zoom={mapZoom} bounds={mapBounds} />

              <TileLayer
                key={tileStyle}
                url={tileConfig.url}
                attribution={tileConfig.attribution}
                className={tileConfig.className}
                maxZoom={18}
              />

              {/* 1. RENDER EVACUATION ROUTE POLYLINES */}
              {routes.map((route) => {
                const isSelected = selectedRoute?.id === route.id;
                return (
                  <React.Fragment key={route.id}>
                    {/* Glowing highlight polyline if selected */}
                    {isSelected && (
                      <Polyline
                        positions={route.path}
                        pathOptions={{
                          color: '#3B82F6',
                          weight: 12,
                          opacity: 0.35,
                          lineCap: 'round',
                          lineJoin: 'round'
                        }}
                      />
                    )}

                    {/* Main Road Corridor Polyline */}
                    <Polyline
                      positions={route.path}
                      pathOptions={{
                        color: route.color,
                        weight: isSelected ? 6 : 4.5,
                        dashArray: route.dashArray || undefined,
                        opacity: isSelected ? 1 : 0.85,
                        lineCap: 'round',
                        lineJoin: 'round'
                      }}
                      eventHandlers={{
                        click: () => handleSelectRoute(route)
                      }}
                    >
                      <Tooltip sticky>
                        <div className="p-1 font-mono text-xs">
                          <strong className="text-slate-900 block">{route.title} ({route.status})</strong>
                          <span>{route.from} → {route.to} ({route.distanceKm} km)</span>
                        </div>
                      </Tooltip>
                    </Polyline>
                  </React.Fragment>
                );
              })}

              {/* 2. RENDER ROUTE ORIGIN WAYPOINT MARKERS (A, B, C, D, E) */}
              {routes.map((route, idx) => {
                const originCoords = route.path[0];
                const letter = route.code ? route.code.replace('Route ', '') : String.fromCharCode(65 + idx);
                return (
                  <Marker
                    key={`origin-${route.id}`}
                    position={originCoords}
                    icon={waypointIcon(letter)}
                    eventHandlers={{ click: () => handleSelectRoute(route) }}
                  >
                    <Popup>
                      <div className="p-1.5 font-mono text-xs text-slate-800 space-y-1">
                        <div className="flex items-center gap-1.5 text-blue-600 font-extrabold text-sm">
                          <Navigation className="h-4 w-4" />
                          <span>{route.title} Checkpoint</span>
                        </div>
                        <p>Origin: <strong>{route.from} Coastal Sector</strong></p>
                        <p>Destination: <strong>{route.to} Safe Zone</strong></p>
                        <p>Distance: <strong>{route.distanceKm} km</strong></p>
                        <p>Road Status: <strong className={route.status === 'Open' ? 'text-emerald-600' : 'text-amber-600'}>{route.status}</strong></p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* 3. RENDER SAFE SHELTER MARKERS (Green house icon) */}
              {SAFE_SHELTERS.map((sh) => (
                <Marker
                  key={sh.id}
                  position={sh.coords}
                  icon={shelterIcon}
                  eventHandlers={{ click: () => handleSelectShelter(sh) }}
                >
                  <Popup>
                    <div className="p-1.5 font-mono text-xs text-slate-800 space-y-1.5 min-w-[200px]">
                      <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-sm">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{sh.name}</span>
                      </div>
                      <p className="text-slate-500">{sh.district} • {sh.distanceFromCoast}</p>
                      <div className="bg-slate-100 p-1.5 rounded">
                        <div className="flex justify-between font-bold">
                          <span>Beds Available:</span>
                          <span className="text-emerald-600">{(sh.capacity - sh.occupied).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Total Capacity:</span>
                          <span>{sh.capacity.toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">Stockpile: {sh.supplies.water} Water • {sh.supplies.food}</p>
                      <p className="text-[11px] text-blue-600">Hotline: {sh.contact}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* 4. RENDER HIGH RISK SURGE ZONES (Orange exclamation icon) */}
              {HIGH_RISK_ZONES.map((rz) => (
                <Marker
                  key={rz.id}
                  position={rz.coords}
                  icon={highRiskIcon}
                >
                  <Popup>
                    <div className="p-1.5 font-mono text-xs text-slate-800 space-y-1 min-w-[210px]">
                      <div className="flex items-center gap-1 text-orange-600 font-extrabold text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{rz.name}</span>
                      </div>
                      <p className="text-rose-600 font-bold">{rz.threat}</p>
                      <p>Evacuation Priority: <strong>{rz.evacPriority}</strong></p>
                      <p>Vulnerable Population: <strong>{rz.populationAtRisk.toLocaleString()}</strong></p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* 5. RENDER BLOCKED CHECKPOINT ON ROUTE E */}
              <Marker
                position={[9.2810, 79.2000]}
                icon={blockedIcon}
              >
                <Popup>
                  <div className="p-1.5 font-mono text-xs text-slate-800 space-y-1">
                    <strong className="text-rose-600 block text-sm">⛔ Pamban Bridge Roadblock</strong>
                    <p>Highway submerged under 3.5m surge waves.</p>
                    <p className="text-slate-500">Mandatory rerouting active.</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Top-Right Map Tile Mode Switcher */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center rounded-xl bg-white/95 p-1 shadow-md border border-slate-200 text-xs font-mono">
              <button
                onClick={() => setTileStyle('osm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  tileStyle === 'osm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Street
              </button>
              <button
                onClick={() => setTileStyle('satellite')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  tileStyle === 'satellite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setTileStyle('dark')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  tileStyle === 'dark' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dark
              </button>
            </div>

            {/* ================= FLOATING MAP LEGEND (Matching Reference Image Exactly) ================= */}
            <div className="absolute bottom-4 right-4 z-[1000] rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif] min-w-[190px]">
              <div className="space-y-2 text-xs">
                {/* Legend Item 1: Evacuation Route */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-0.5 bg-blue-600 rounded"></div>
                  <span className="font-semibold text-slate-700">Evacuation Route</span>
                </div>

                {/* Legend Item 2: Safe Shelter */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-700">Safe Shelter</span>
                </div>

                {/* Legend Item 3: High Risk Zone */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shadow-xs font-bold text-[10px]">
                    ⚠️
                  </div>
                  <span className="font-semibold text-slate-700">High Risk Zone</span>
                </div>

                {/* Legend Item 4: Blocked Route */}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 border-t-2 border-dashed border-rose-500"></div>
                  <span className="font-semibold text-slate-700">Blocked Route</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= ADMIN CREATE EVACUATION CORRIDOR MODAL ================= */}
      {showCreateModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900 font-mono">
                  Launch New Evacuation Corridor (Admin)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-1">
                  Plan Operation Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operation Suraksha: Sector D Cuddalore Rapid Evac"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-1">
                    Origin Coastal City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahabalipuram"
                    value={newPlan.from}
                    onChange={(e) => setNewPlan({ ...newPlan, from: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-1">
                    Destination Safe Hub *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kanchipuram"
                    value={newPlan.to}
                    onChange={(e) => setNewPlan({ ...newPlan, to: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-1">
                    Corridor Distance (km)
                  </label>
                  <input
                    type="number"
                    value={newPlan.distanceKm}
                    onChange={(e) => setNewPlan({ ...newPlan, distanceKm: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-1">
                    Population to Evacuate
                  </label>
                  <input
                    type="number"
                    value={newPlan.populationRequiringEvacuation}
                    onChange={(e) => setNewPlan({ ...newPlan, populationRequiringEvacuation: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-700 font-bold mb-1">
                  Tactical Operational Directives
                </label>
                <textarea
                  rows="2"
                  placeholder="Special instructions, designated assembly points, medical escorts..."
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold px-5 py-2 transition uppercase font-mono shadow-md disabled:opacity-50"
                >
                  {creating ? 'Activating...' : 'Deploy Evacuation Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EvacuationPlanning;
