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
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  volunteerDetails: {
    name: { type: String, default: 'Aravind Swaminathan (Field Rescue Volunteer)' },
    phone: { type: String, default: '+91 94440 12891' },
    skills: { type: String, default: 'Flood Rescue, First Aid & Evacuation' },
    status: { type: String, default: 'EN_ROUTE' },
    coordinates: { type: [Number], default: [80.2625, 13.0745] },
    updatedAt: { type: Date, default: Date.now }
  },
  citizenLiveLocation: {
    coordinates: { type: [Number], default: [80.2707, 13.0827] },
    accuracy: { type: Number, default: 12 },
    heading: { type: Number, default: 0 },
    speed: { type: Number, default: 0 },
    isSharingLive: { type: Boolean, default: true },
    updatedAt: { type: Date, default: Date.now }
  },
  teamLiveLocation: {
    coordinates: { type: [Number], default: [80.2550, 13.0920] },
    heading: { type: Number, default: 0 },
    speed: { type: Number, default: 35 },
    status: { type: String, default: 'EN_ROUTE' },
    updatedAt: { type: Date, default: Date.now }
  },
  resolutionNotes: { type: String, default: '' },
  reportedAt: { type: Date, default: Date.now },
  assignedAt: { type: Date },
  resolvedAt: { type: Date }
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
