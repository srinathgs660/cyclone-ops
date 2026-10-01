const mongoose = require('mongoose');
const { INCIDENT_STATUS, INCIDENT_PRIORITY } = require('../config/constants');

const incidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  emergencyType: {
    type: String,
    required: true,
    enum: [
      'Trapped Civilians',
      'Medical Emergency',
      'Severe Flooding',
      'Road Blockage / Debris',
      'Building Collapse / Structural Risk',
      'Missing Person',
      'Food/Water Crisis',
      'Power Grid Failure',
      'Other Emergency'
    ]
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, required: true },
  district: { type: String, default: 'Chennai' },
  severity: {
    type: String,
    enum: Object.values(INCIDENT_PRIORITY),
    default: INCIDENT_PRIORITY.MEDIUM
  },
  priorityScore: { type: Number, default: 50, min: 0, max: 100 },
  status: {
    type: String,
    enum: Object.values(INCIDENT_STATUS),
    default: INCIDENT_STATUS.REPORTED
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterName: { type: String, default: 'Anonymous Citizen' },
  reporterPhone: { type: String, default: '' },
  victimCount: { type: Number, default: 1 },
  description: { type: String, default: '' },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseTeam' },
  resolutionNotes: { type: String, default: '' },
  reportedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  resolvedAt: { type: Date }
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
