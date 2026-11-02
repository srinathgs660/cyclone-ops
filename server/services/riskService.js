const RiskZone = require('../models/RiskZone');
const Cyclone = require('../models/Cyclone');
const { RISK_LEVELS } = require('../config/constants');
const { emitEvent } = require('../sockets/socketManager');
const { mockRiskZones } = require('../config/mockData');

const calculateDistanceKm = (coords1, coords2) => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const computeZoneRisk = (zone, activeCyclone) => {
  let distanceKm = 9999;
  let cycloneFactor = 0;
  let stormSurgeMeters = 0.3; // Baseline normal sea level / tide
  let roadAccessPct = 96;     // Baseline clear road conditions

  if (activeCyclone && activeCyclone.currentLocation && activeCyclone.currentLocation.coordinates) {
    distanceKm = calculateDistanceKm(zone.center.coordinates, activeCyclone.currentLocation.coordinates);
    const windKmH = activeCyclone.windSpeed || 100;

    // A cyclone only poses direct physical hazard if within 1,000 km
    if (distanceKm <= 1000) {
      // Proximity score: 100 at 0km, down to 0 at 1000km
      const proximityScore = Math.max(0, 100 - (distanceKm * 0.10));
      const windScore = Math.min(100, (windKmH / 260) * 100);
      cycloneFactor = (proximityScore * 0.65) + (windScore * 0.35);

      // Surge height estimate based on wind and proximity
      const proximityRatio = Math.max(0, (1000 - distanceKm) / 1000);
      const intensityRatio = Math.min(2.0, windKmH / 120);
      stormSurgeMeters = parseFloat((0.3 + (proximityRatio * intensityRatio * 3.5)).toFixed(1));

      // Road accessibility drops as surge and rain flooding increase
      const waterloggingImpact = Math.round(proximityRatio * (windKmH / 200) * 45);
      roadAccessPct = Math.max(35, 96 - waterloggingImpact);
    } else {
      // Storm is thousands of km away (e.g. 12,000+ km in another ocean basin) -> 0 cyclone hazard
      cycloneFactor = 0;
      stormSurgeMeters = 0.3;
      roadAccessPct = 96;
    }
  }

  const vulnRatio = zone.population > 0 ? (zone.vulnerablePopulation / zone.population) : 0.15;
  const vulnScore = Math.min(40, vulnRatio * 150);

  const infra = zone.infrastructureExposure || {};
  const infraCount = (infra.hospitals || 0) * 2 + (infra.powerStations || 0) * 3 + (infra.ports || 0) * 4 + (infra.bridges || 0) * 2;
  const infraScore = Math.min(30, infraCount * 1.5);

  const roadRisk = Math.max(0, 100 - roadAccessPct);
  const shelterDeficit = Math.max(0, (zone.shelterCapacityPercent || 50));

  let rawScore = 0;
  if (cycloneFactor === 0) {
    // Normal baseline readiness score under calm conditions: LOW risk (10 - 20)
    rawScore = 12 + (vulnScore * 0.08) + (infraScore * 0.06);
  } else {
    rawScore = (cycloneFactor * 0.45) + (vulnScore * 0.18) + (infraScore * 0.12) + (roadRisk * 0.15) + (shelterDeficit * 0.10);
  }

  const riskScore = Math.min(100, Math.max(10, Math.round(rawScore)));

  let riskLevel = RISK_LEVELS.LOW;
  let priority = 'LOW';
  if (riskScore > 80) { riskLevel = RISK_LEVELS.CRITICAL; priority = 'CRITICAL'; }
  else if (riskScore > 60) { riskLevel = RISK_LEVELS.VERY_HIGH; priority = 'VERY_HIGH'; }
  else if (riskScore > 40) { riskLevel = RISK_LEVELS.HIGH; priority = 'HIGH'; }
  else if (riskScore > 20) { riskLevel = RISK_LEVELS.MODERATE; priority = 'MODERATE'; }

  return {
    riskScore,
    riskLevel,
    priority,
    stormSurgeHeightMeters: stormSurgeMeters,
    roadAccessibilityPercent: roadAccessPct,
    cycloneDistanceKm: Math.round(distanceKm),
    lastAssessed: new Date()
  };
};

const recalculateAllRisk = async () => {
  let activeCyclone = null;
  try {
    const { getLiveCyclones } = require('./liveCycloneService');
    const liveCyclones = await getLiveCyclones();
    if (liveCyclones && liveCyclones.length > 0) {
      // Prioritize storms in Indian Ocean, else first active storm
      const indianOceanStorm = liveCyclones.find(c => c.basinCode === 'indian-ocean');
      activeCyclone = indianOceanStorm || liveCyclones[0];
    }
  } catch (err) {
    // ignore
  }

  if (!activeCyclone) {
    try {
      activeCyclone = await Cyclone.findOne({ status: { '$ne': 'DISSIPATED' } }).sort({ windSpeed: -1 });
    } catch (err) {
      // ignore
    }
  }

  try {
    const zones = await RiskZone.find({});
    if (zones && zones.length > 0) {
      const updatedZones = [];
      for (const zone of zones) {
        const assessment = computeZoneRisk(zone, activeCyclone);
        zone.riskScore = assessment.riskScore;
        zone.riskLevel = assessment.riskLevel;
        zone.evacuationPriority = assessment.priority;
        zone.priorityScore = assessment.riskScore;
        zone.cycloneDistanceKm = assessment.cycloneDistanceKm;
        zone.stormSurgeHeightMeters = assessment.stormSurgeHeightMeters;
        zone.roadAccessibilityPercent = assessment.roadAccessibilityPercent;
        zone.lastAssessed = assessment.lastAssessed;
        await zone.save();
        updatedZones.push(zone);
      }
      emitEvent('risk:update', {
        timestamp: new Date(),
        zonesCount: updatedZones.length,
        activeCyclone: activeCyclone ? activeCyclone.name : null
      });
      return updatedZones;
    }
  } catch (err) {
    console.warn('[recalculateAllRisk] MongoDB not available, recalculating in-memory mock zones...');
  }

  // Recalculate mockRiskZones in-memory fallback
  for (const zone of mockRiskZones) {
    const assessment = computeZoneRisk(zone, activeCyclone);
    zone.riskScore = assessment.riskScore;
    zone.riskLevel = assessment.riskLevel;
    zone.evacuationPriority = assessment.priority;
    zone.priorityScore = assessment.riskScore;
    zone.cycloneDistanceKm = assessment.cycloneDistanceKm;
    zone.stormSurgeHeightMeters = assessment.stormSurgeHeightMeters;
    zone.roadAccessibilityPercent = assessment.roadAccessibilityPercent;
    zone.lastAssessed = assessment.lastAssessed;
  }

  emitEvent('risk:update', {
    timestamp: new Date(),
    zonesCount: mockRiskZones.length,
    activeCyclone: activeCyclone ? activeCyclone.name : null
  });
  return mockRiskZones;
};

module.exports = { calculateDistanceKm, computeZoneRisk, recalculateAllRisk };
