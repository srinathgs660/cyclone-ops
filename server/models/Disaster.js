const mongoose = require('mongoose');
const { DISASTER_TYPES } = require('../config/constants');

const disasterSchema = new mongoose.Schema({
  externalId: { type: String, index: true },
  source: { type: String, default: 'INTERNAL' },
  type: {
    type: String,
    enum: Object.values(DISASTER_TYPES),
    default: DISASTER_TYPES.CYCLONE
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  severity: {
    type: String,
    enum: ['GREEN', 'ORANGE', 'RED', 'CRITICAL'],
    default: 'ORANGE'
  },
  alertLevel: { type: String, default: 'WARNING' },
  riskScore: { type: Number, default: 50, min: 0, max: 100 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  country: { type: String, default: 'India' },
  region: { type: String, default: 'Bay of Bengal' },
  magnitude: { type: Number, default: 0 },
  magnitudeUnit: { type: String, default: 'km/h' },
  startTime: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: {
    type: String,
    enum: ['MONITORING', 'ACTIVE', 'ESCALATING', 'RECEDING', 'RESOLVED'],
    default: 'ACTIVE'
  },
  affectedAreas: [{ type: String }],
  sourceUrl: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

disasterSchema.index({ location: '2dsphere' });
disasterSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('Disaster', disasterSchema);
