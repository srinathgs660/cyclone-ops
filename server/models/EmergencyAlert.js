const mongoose = require('mongoose');
const { ALERT_SEVERITY, ALERT_TYPES } = require('../config/constants');

const emergencyAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: Object.values(ALERT_TYPES),
    default: ALERT_TYPES.CYCLONE_WARNING
  },
  severity: {
    type: String,
    enum: Object.values(ALERT_SEVERITY),
    default: ALERT_SEVERITY.WARNING
  },
  description: { type: String, required: true },
  affectedRegions: [{ type: String }],
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuerName: { type: String, default: 'Disaster Operations Command' },
  targetAudience: {
    type: String,
    enum: ['ALL', 'RESIDENTS', 'AGENCIES', 'RESPONSE_TEAMS'],
    default: 'ALL'
  },
  broadcastChannels: [{ type: String }],
  active: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

emergencyAlertSchema.index({ active: 1, severity: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
