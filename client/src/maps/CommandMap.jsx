import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Eye, Layers, Shield, Navigation, Home, AlertTriangle, Users, Compass } from 'lucide-react';

// Custom Map Helper to fly to coordinates or fit bounds
const MapRecenter = ({ center, zoom, bounds }) => {
  const map = useMap();
  React.useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 3, animate: true, duration: 1.2 });
    } else if (center && center[0] !== undefined && center[1] !== undefined) {
      map.flyTo(center, zoom !== undefined ? zoom : 9, { duration: 1.2 });
    }
  }, [center, zoom, bounds, map]);
  return null;
};

// Custom SVG Icons
const createCustomIcon = (htmlContent, className = '', size = [36, 36]) => {
  return L.divIcon({
    html: htmlContent,
    className: `custom-map-icon ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2]
  });
};

const cycloneIcon = createCustomIcon(`
  <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
    <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(244, 63, 94, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
    <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(244, 63, 94, 0.4); border: 2px solid #F43F5E;"></div>
    <span style="font-size: 20px; z-index: 10; animation: spin 4s linear infinite;">🌀</span>
  </div>
`, 'cyclone-marker', [44, 44]);

const shelterIcon = (status) => {
  const color = status === 'FULL' ? '#EF4444' : status === 'FILLING' ? '#F59E0B' : '#10B981';
  return createCustomIcon(`
    <div style="background: ${color}; color: #0F172A; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
      🏠
    </div>
  `, 'shelter-marker', [28, 28]);
};

const incidentIcon = (severity) => {
  const color = severity === 'CRITICAL' ? '#EF4444' : severity === 'HIGH' ? '#F97316' : '#EAB308';
  return createCustomIcon(`
    <div style="background: ${color}; color: white; border: 2px solid #0F172A; border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
      ⚠️
    </div>
  `, 'incident-marker', [30, 30]);
};

const teamIcon = createCustomIcon(`
  <div style="background: #3B82F6; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
    🚑
  </div>
`, 'team-marker', [28, 28]);

const CommandMap = ({
  cyclones = [],
  selectedCycloneId,
  onCycloneSelect,
  riskZones = [],
  shelters = [],
  incidents = [],
  responseTeams = [],
  evacuationPlans = [],
  centerCoords = [13.0827, 80.2707], // Default Chennai Coast
  zoom = 9,
  onShelterSelect
}) => {
  const [layers, setLayers] = useState({
    cyclones: true,
    forecast: true,
    riskZones: true,
    shelters: true,
    incidents: true,
    teams: true,
    routes: true
  });

  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState({
    center: centerCoords,
    zoom: zoom || 9,
    bounds: null,
    key: 0
  });

  React.useEffect(() => {
    setMapTarget(prev => ({
      ...prev,
      center: centerCoords,
      zoom: zoom || 9
    }));
  }, [centerCoords, zoom]);

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const focusCyclone = () => {
    const target = (cyclones && cyclones.find(c => c._id === selectedCycloneId)) || (cyclones && cyclones[0]);
    if (target?.currentLocation?.coordinates) {
      const [lng, lat] = target.currentLocation.coordinates;
      setMapTarget({
        center: [lat, lng],
        zoom: 7,
        bounds: null,
        key: Date.now()
      });
    }
  };

  const showWorldView = () => {
    // Zoom out completely to Level 2 to display the entire globe (Americas, Atlantic, Africa, Indian Ocean, Pacific)
    setMapTarget({
      center: [15, 10],
      zoom: 2,
      bounds: null,
      key: Date.now()
    });
  };

  const resetCoastView = () => {
    setMapTarget({
      center: centerCoords,
      zoom: zoom || 9,
      bounds: null,
      key: Date.now()
    });
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0B1120] shadow-2xl">
      {/* Top Map Action Bar */}
      <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2">
        <button
          onClick={focusCyclone}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md shadow-lg transition hover:bg-slate-800"
          title="Track Active Cyclone Eye"
        >
          <Compass className="h-4 w-4 text-cyan-400" />
          Focus Eye
        </button>

        <button
          onClick={showWorldView}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg transition ${
            mapTarget.zoom <= 2
              ? 'border-indigo-400 bg-indigo-600/40 text-white font-bold ring-1 ring-indigo-400/50'
              : 'border-indigo-500/40 bg-slate-900/90 text-indigo-300 hover:bg-slate-800'
          }`}
          title="Zoom out to Global Worldwide View (All Continents & Oceans)"
        >
          <span>🌍</span>
          <span>World View</span>
        </button>

        <button
          onClick={resetCoastView}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md shadow-lg transition hover:bg-slate-800"
          title="Reset to Coastal Command View"
        >
          <Navigation className="h-4 w-4" />
          Coast Center
        </button>

        <div className="relative">
          <button
            onClick={() => setLayerMenuOpen(!layerMenuOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md shadow-lg transition hover:bg-slate-800"
          >
            <Layers className="h-4 w-4 text-cyan-400" />
            Layers ({Object.values(layers).filter(Boolean).length})
          </button>

          {layerMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-700 bg-[#131D31]/95 p-3 shadow-2xl backdrop-blur-md">
              <p className="border-b border-slate-800 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                GIS Command Layers
              </p>
              <div className="mt-2 space-y-1.5 text-xs">
                {Object.entries(layers).map(([key, val]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between rounded p-1 hover:bg-slate-800/60">
                    <span className="capitalize text-slate-300">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={() => toggleLayer(key)}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={centerCoords}
        zoom={zoom}
        minZoom={2}
        worldCopyJump={true}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        style={{ minHeight: '480px' }}
      >
        <MapRecenter
          center={mapTarget.center}
          zoom={mapTarget.zoom}
          bounds={mapTarget.bounds}
          key={mapTarget.key}
        />

        {/* High-Contrast Tactical Dark Map Tiles (OpenStreetMap - 100% Free, No API Key, No Watermark) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
          maxZoom={19}
          minZoom={2}
        />

        {/* 1. CYCLONES LAYER */}
        {layers.cyclones && cyclones.map((c) => {
          if (!c.currentLocation?.coordinates) return null;
          const [cLng, cLat] = c.currentLocation.coordinates;
          const isSelected = selectedCycloneId 
            ? (c._id === selectedCycloneId || c.name === selectedCycloneId)
            : true;

          const pastPositions = (c.pastTrack || []).map(pt => [pt.coordinates[1], pt.coordinates[0]]);
          pastPositions.push([cLat, cLng]);

          return (
            <React.Fragment key={c._id || c.name}>
              {/* Cyclone Eye Marker */}
              <Marker
                position={[cLat, cLng]}
                icon={cycloneIcon}
                eventHandlers={{
                  click: () => {
                    if (onCycloneSelect) onCycloneSelect(c);
                  }
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[220px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <div>
                        <h4 className="font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{c.flag || '🌀'}</span>
                          <span>{c.name.toUpperCase()}</span>
                        </h4>
                        <span className="text-[10px] text-cyan-400 font-mono block">
                          {c.basin || c.subBasin || 'Active Basin'}
                        </span>
                      </div>
                      <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 font-mono">
                        {c.category}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>Wind: <strong className="text-cyan-300 font-mono">{c.windSpeed} km/h</strong></div>
                      <div>Baro: <strong className="text-amber-300 font-mono">{c.pressure} hPa</strong></div>
                      <div>Dir: <strong className="font-mono">{c.movementDirection}</strong></div>
                      <div>Speed: <strong className="font-mono">{c.movementSpeed} km/h</strong></div>
                    </div>
                    {c.source && (
                      <div className="mt-2 text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-1 flex items-center justify-between">
                        <span>Source:</span>
                        <span className="text-cyan-300 font-semibold">{c.source}</span>
                      </div>
                    )}
                    {c.landfallEstimate && (
                      <p className="mt-2 text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-500/30">
                        Landfall Est: <strong>{c.landfallEstimate.locationName}</strong>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Intensity Radii Circles (focused for selected cyclone) */}
              {isSelected && (
                <>
                  <Circle
                    center={[cLat, cLng]}
                    radius={(c.intensityRadius?.hurricaneWindKm || 45) * 1000}
                    pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.25, weight: 1.5 }}
                  />
                  <Circle
                    center={[cLat, cLng]}
                    radius={(c.intensityRadius?.stormWindKm || 90) * 1000}
                    pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.15, weight: 1 }}
                  />
                  <Circle
                    center={[cLat, cLng]}
                    radius={(c.intensityRadius?.galeWindKm || 180) * 1000}
                    pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.08, weight: 1, dashArray: '4, 4' }}
                  />
                </>
              )}

              {/* Past Solid Track */}
              <Polyline
                positions={pastPositions}
                pathOptions={{ color: isSelected ? '#38BDF8' : '#64748B', weight: isSelected ? 3 : 2, opacity: 0.7 }}
              />

              {/* 2. FORECAST CONE & TRACK */}
              {layers.forecast && isSelected && c.forecastTrack && c.forecastTrack.length > 0 && (
                <>
                  <Polyline
                    positions={[[cLat, cLng], ...c.forecastTrack.map(f => [f.coordinates[1], f.coordinates[0]])]}
                    pathOptions={{ color: '#F43F5E', weight: 3, dashArray: '6, 6', opacity: 0.9 }}
                  />

                  {c.forecastTrack.map((fp, idx) => (
                    <Circle
                      key={idx}
                      center={[fp.coordinates[1], fp.coordinates[0]]}
                      radius={(fp.uncertaintyRadiusKm || 40) * 1000}
                      pathOptions={{ color: '#F43F5E', fillColor: '#F43F5E', fillOpacity: 0.12, weight: 1 }}
                    >
                      <Tooltip direction="top" offset={[0, -10]}>
                        <div className="text-[11px] font-mono">
                          <strong>Forecast Point +{(idx + 1) * 6}h</strong><br/>
                          Wind: {fp.windSpeed} km/h • {fp.category}
                        </div>
                      </Tooltip>
                    </Circle>
                  ))}
                </>
              )}
            </React.Fragment>
          );
        })}

        {/* 3. RISK ZONES LAYER */}
        {layers.riskZones && riskZones.map((z) => {
          if (!z.center?.coordinates) return null;
          const [zLng, zLat] = z.center.coordinates;

          const zoneColors = {
            CRITICAL: { color: '#EF4444', fill: '#EF4444' },
            VERY_HIGH: { color: '#F97316', fill: '#F97316' },
            HIGH: { color: '#F59E0B', fill: '#F59E0B' },
            MODERATE: { color: '#EAB308', fill: '#EAB308' },
            LOW: { color: '#10B981', fill: '#10B981' }
          };

          const zPalette = zoneColors[z.riskLevel] || zoneColors.HIGH;

          return (
            <Circle
              key={z._id || z.name}
              center={[zLat, zLng]}
              radius={(z.radiusKm || 12) * 1000}
              pathOptions={{
                color: zPalette.color,
                fillColor: zPalette.fill,
                fillOpacity: 0.22,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-white">{z.name}</h4>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="font-mono font-bold text-rose-400">Risk Score: {z.riskScore}/100</span>
                    <span>• {z.riskLevel}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-300">
                    <div>Population at Risk: <strong>{z.population?.toLocaleString()}</strong></div>
                    <div>Vulnerable Count: <strong>{z.vulnerablePopulation?.toLocaleString()}</strong></div>
                    <div>Road Accessibility: <strong>{z.roadAccessibilityPercent}%</strong></div>
                    <div>Available Shelter Capacity: <strong>{z.shelterCapacityPercent}%</strong></div>
                    <div>Priority: <strong className="text-rose-400">{z.evacuationPriority}</strong></div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* 4. SHELTERS LAYER */}
        {layers.shelters && shelters.map((s) => {
          if (!s.location?.coordinates) return null;
          const [sLng, sLat] = s.location.coordinates;

          return (
            <Marker
              key={s._id || s.code}
              position={[sLat, sLng]}
              icon={shelterIcon(s.status)}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                    <h5 className="font-bold text-white text-xs">{s.name}</h5>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-300' :
                      s.status === 'FILLING' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">{s.address}</p>

                  <div className="mt-2.5">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Occupancy:</span>
                      <strong>{s.occupied} / {s.totalCapacity} ({s.occupancyPercent}%)</strong>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full transition-all ${
                          s.occupancyPercent >= 90 ? 'bg-rose-500' :
                          s.occupancyPercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${s.occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-emerald-400">
                    Available Capacity: <strong>{s.available} slots</strong>
                  </div>

                  {onShelterSelect && (
                    <button
                      onClick={() => onShelterSelect(s)}
                      className="mt-3 w-full rounded bg-cyan-600/30 border border-cyan-500/40 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-600/50"
                    >
                      Route Evacuees Here
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. INCIDENTS LAYER */}
        {layers.incidents && incidents.map((inc) => {
          if (!inc.location?.coordinates) return null;
          const [iLng, iLat] = inc.location.coordinates;

          return (
            <Marker
              key={inc._id || inc.incidentId}
              position={[iLat, iLng]}
              icon={incidentIcon(inc.severity)}
            >
              <Popup>
                <div className="p-1 min-w-[210px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                    <span className="font-mono text-[10px] text-slate-400">{inc.incidentId}</span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                      {inc.severity}
                    </span>
                  </div>
                  <h5 className="mt-1 font-bold text-white text-xs">{inc.title}</h5>
                  <p className="mt-1 text-[11px] text-slate-300">{inc.description}</p>
                  <div className="mt-2 text-xs text-slate-400">
                    Status: <strong className="text-cyan-300">{inc.status}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 6. RESPONSE TEAMS LAYER */}
        {layers.teams && responseTeams.map((t) => {
          if (!t.currentLocation?.coordinates) return null;
          const [tLng, tLat] = t.currentLocation.coordinates;

          return (
            <Marker
              key={t._id || t.teamId}
              position={[tLat, tLng]}
              icon={teamIcon}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <h5 className="font-bold text-white">{t.name}</h5>
                  <p className="text-slate-400">{t.type} • {t.membersCount} Members</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span>Status:</span>
                    <strong className="text-emerald-400">{t.status}</strong>
                  </div>
                  <p className="mt-1 text-slate-400">Vehicle: {t.vehicle?.type}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 7. EVACUATION ROUTES LAYER */}
        {layers.routes && evacuationPlans.map((ep) => {
          if (!ep.routes) return null;
          return ep.routes.map((r, rIdx) => {
            if (!r.waypoints || r.waypoints.length === 0) return null;
            const positions = r.waypoints.map(wp => [wp[1], wp[0]]);

            return (
              <Polyline
                key={`${ep._id}-${rIdx}`}
                positions={positions}
                pathOptions={{
                  color: r.roadStatus === 'BLOCKED' ? '#EF4444' : r.roadStatus === 'CAUTION' ? '#F59E0B' : '#06B6D4',
                  weight: 4,
                  opacity: 0.85
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-mono">
                    <strong>{r.name}</strong><br/>
                    Status: {r.roadStatus} • {r.distanceKm} km ({r.estimatedDurationMin} min)
                  </div>
                </Tooltip>
              </Polyline>
            );
          });
        })}
      </MapContainer>
    </div>
  );
};

export default CommandMap;
