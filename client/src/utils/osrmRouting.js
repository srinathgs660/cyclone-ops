// Real-Time OpenStreetMap (OSRM) Road Network & Disaster-Avoidance Routing Engine

export const TAMIL_NADU_CITY_COORDS = {
  chennai: [13.0796, 80.2608],
  vellore: [12.9165, 79.1325],
  cuddalore: [11.7569, 79.7590],
  trichy: [10.7905, 78.7047],
  tiruchirappalli: [10.7905, 78.7047],
  nagapattinam: [10.7656, 79.8325],
  thanjavur: [10.7870, 79.1378],
  puducherry: [11.9338, 79.7975],
  pondicherry: [11.9338, 79.7975],
  villupuram: [11.9401, 79.4861],
  rameswaram: [9.2876, 79.3129],
  madurai: [9.9252, 78.1198],
  mahabalipuram: [12.6208, 80.1944],
  mamallapuram: [12.6208, 80.1944],
  kanchipuram: [12.8342, 79.7036],
  chengalpattu: [12.6841, 79.9836],
  tindivanam: [12.2353, 79.6504],
  tiruvannamalai: [12.2253, 79.0747],
  chidambaram: [11.3992, 79.6935],
  mayiladuthurai: [11.1018, 79.6526],
  kumbakonam: [10.9602, 79.3845],
  tiruvarur: [10.7661, 79.6344],
  karaikal: [10.9254, 79.8380],
  ramanathapuram: [9.3639, 78.8395],
  tuticorin: [8.7642, 78.1348],
  thoothukudi: [8.7642, 78.1348],
  tirunelveli: [8.7139, 77.7567],
  kanyakumari: [8.0883, 77.5385],
  salem: [11.6643, 78.1460],
  erode: [11.3410, 77.7172],
  coimbatore: [11.0168, 76.9558],
  panruti: [11.7744, 79.5539],
  ulundurpet: [11.6911, 79.2885],
  perambalur: [11.2342, 78.8807]
};

/**
 * Resolves a city name to [lat, lng] coordinates in Tamil Nadu
 */
export function resolveCityCoords(cityName, fallbackCoords = [12.6208, 80.1944]) {
  if (!cityName || typeof cityName !== 'string') return fallbackCoords;
  const key = cityName.trim().toLowerCase();
  if (TAMIL_NADU_CITY_COORDS[key]) return TAMIL_NADU_CITY_COORDS[key];
  for (const [k, coords] of Object.entries(TAMIL_NADU_CITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return coords;
  }
  return fallbackCoords;
}

/**
 * Fetches exact street-level road geometry ([lat, lng][]) from OpenStreetMap OSRM engines.
 * Uses routing.openstreetmap.de with automatic fallback to router.project-osrm.org.
 */
export async function fetchOSRMRoadRoute(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) {
    return null;
  }

  const coordStr = waypoints
    .map(([lat, lng]) => `${Number(lng).toFixed(5)},${Number(lat).toFixed(5)}`)
    .join(';');

  const endpoints = [
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`,
    `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const data = await res.json();
      if (data?.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates?.length > 1) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [
          Number(lat.toFixed(5)),
          Number(lng.toFixed(5))
        ]);
        const distanceKm = Math.max(1, Math.round(route.distance / 1000));
        const durationMin = Math.max(1, Math.round(route.duration / 60));

        return {
          coordinates,
          distanceKm,
          durationMin
        };
      }
    } catch {
      // Try next endpoint
    }
  }

  return null;
}
