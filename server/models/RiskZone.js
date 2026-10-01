const mongoose = require('mongoose');
const { RISK_LEVELS } = require('../config/constants');

const riskZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  riskLevel: {
    type: String,
    enum: Object.values(RISK_LEVELS),
    default: RISK_LEVELS.MODERATE
  },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  center: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  radiusKm: { type: Number, default: 15 },
  population: { type: Number, default: 50000 },
  vulnerablePopulation: { type: Number, default: 12000 },
  infrastructureExposure: {
    hospitals: { type: Number, default: 4 },
    schools: { type: Number, default: 12 },
    powerStations: { type: Number, default: 2 },
    bridges: { type: Number, default: 3 },
    ports: { type: Number, default: 1 }
  },
  shelterCount: { type: Number, default: 5 },
  shelterCapacityPercent: { type: Number, default: 60 },
  roadAccessibilityPercent: { type: Number, default: 85 },
  evacuationPriority: {
    type: String,
    enum: ['CRITICAL', 'VERY_HIGH', 'HIGH', 'MODERATE', 'LOW'],
    default: 'HIGH'
  },
  priorityScore: { type: Number, default: 70 },
  lastAssessed: { type: Date, default: Date.now },
  cycloneDistanceKm: { type: Number, default: 120 },
  floodRiskLevel: { type: String, default: 'HIGH' },
  stormSurgeHeightMeters: { type: Number, default: 2.5 }
}, { timestamps: true });

riskZoneSchema.index({ center: '2dsphere' });
riskZoneSchema.index({ riskScore: -1 });

module.exports = mongoose.model('RiskZone', riskZoneSchema);
