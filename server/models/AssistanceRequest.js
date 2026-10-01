const mongoose = require('mongoose');

const assistanceRequestSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  emergencyType: {
    type: String,
    required: true,
    enum: [
      'Trapped',
      'Trapped Civilians',
      'Medical Emergency',
      'Flooding',
      'Severe Flooding',
      'Building Damage',
      'Building Collapse / Structural Risk',
      'Road Blockage / Debris',
      'Missing Person',
      'Food/Water Shortage',
      'Food/Water Crisis',
      'Power Grid Failure',
      'Other',
      'Other Emergency'
    ]
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, default: 'Coastal Sector' },
  peopleCount: { type: Number, default: 1 },
  specialNeeds: [{ type: String }],
  description: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'HIGH'
  },
  status: {
    type: String,
    enum: ['RECEIVED', 'TRIAGED', 'TEAM_DISPATCHED', 'RESCUED', 'CLOSED'],
    default: 'RECEIVED'
  },
  assignedIncident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }
}, { timestamps: true });

assistanceRequestSchema.index({ location: '2dsphere' });
assistanceRequestSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('AssistanceRequest', assistanceRequestSchema);
