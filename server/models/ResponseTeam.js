const mongoose = require('mongoose');
const { TEAM_STATUS } = require('../config/constants');

const responseTeamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Search & Rescue', 'Medical Response', 'Fire & Rescue', 'Law Enforcement', 'Engineering & Debris', 'Logistics & Supply', 'Communication & Radio'],
    required: true
  },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  membersCount: { type: Number, default: 8 },
  leaderName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  status: {
    type: String,
    enum: Object.values(TEAM_STATUS),
    default: TEAM_STATUS.AVAILABLE
  },
  vehicle: {
    type: { type: String, default: 'All-Terrain Rescue Vehicle' },
    plateNumber: { type: String, default: 'TN-01-DM-9912' },
    capacity: { type: Number, default: 6 }
  },
  equipment: [{ type: String }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  memberDetails: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    role: String,
    phone: String,
    skills: [String]
  }],
  assignedIncident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  assignedZone: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskZone' }
}, { timestamps: true });

responseTeamSchema.index({ currentLocation: '2dsphere' });
responseTeamSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('ResponseTeam', responseTeamSchema);
