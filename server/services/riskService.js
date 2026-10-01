const RiskZone = require('../models/RiskZone');
const Cyclone = require('../models/Cyclone');
const { RISK_LEVELS } = require('../config/constants');
const { emitEvent } = require('../sockets/socketManager');

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
  let cycloneFactor = 25;
  let distanceKm = 999;
  if (activeCyclone && activeCyclone.currentLocation && activeCyclone.currentLocation.coordinates) {
    distanceKm = calculateDistanceKm(zone.center.coordinates, activeCyclone.currentLocation.coordinates);
    const windKmH = activeCyclone.windSpeed || 130;
    const proximityScore = Math.max(0, 100 - (distanceKm * 0.35));
    const windScore = Math.min(100, (windKmH / 260) * 100);
    cycloneFactor = (proximityScore * 0.6) + (windScore * 0.4);
  }
  const vulnRatio = zone.population > 0 ? (zone.vulnerablePopulation / zone.population) : 0.2;
  const vulnScore = Math.min(100, vulnRatio * 250);
  const infra = zone.infrastructureExposure || {};
  const infraCount = (infra.hospitals || 0) * 3 + (infra.powerStations || 0) * 4 + (infra.ports || 0) * 5 + (infra.bridges || 0) * 2;
  const infraScore = Math.min(100, infraCount * 3.5);
  const roadRisk = Math.max(0, 100 - (zone.roadAccessibilityPercent || 70));
  const shelterDeficit = Math.max(0, (zone.shelterCapacityPercent || 50));
  const rawScore = (cycloneFactor * 0.40) + (vulnScore * 0.20) + (infraScore * 0.15) + (roadRisk * 0.15) + (shelterDeficit * 0.10);
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
    cycloneDistanceKm: Math.round(distanceKm),
    lastAssessed: new Date()
  };
};

const recalculateAllRisk = async () => {
  const activeCyclone = await Cyclone.findOne({ status: { '$ne': 'DISSIPATED' } }).sort({ windSpeed: -1 });
  const zones = await RiskZone.find({});
  const updatedZones = [];
  for (const zone of zones) {
    const assessment = computeZoneRisk(zone, activeCyclone);
    zone.riskScore = assessment.riskScore;
    zone.riskLevel = assessment.riskLevel;
    zone.evacuationPriority = assessment.priority;
    zone.priorityScore = assessment.riskScore;
    zone.cycloneDistanceKm = assessment.cycloneDistanceKm;
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
};

module.exports = { calculateDistanceKm, computeZoneRisk, recalculateAllRisk };
