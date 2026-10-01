const mongoose = require('mongoose');

const evacuationPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskZone', required: true },
  zoneName: { type: String, required: true },
  targetShelters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' }],
  populationRequiringEvacuation: { type: Number, required: true },
  evacuatedCount: { type: Number, default: 0 },
  remainingCount: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0 },
  priorityScore: { type: Number, default: 75 },
  status: {
    type: String,
    enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  routes: [{
    name: { type: String },
    startPoint: { type: [Number] },
    endPoint: { type: [Number] },
    waypoints: [[Number]],
    distanceKm: { type: Number },
    estimatedDurationMin: { type: Number },
    roadStatus: { type: String, enum: ['CLEAR', 'CAUTION', 'BLOCKED'], default: 'CLEAR' },
    riskLevel: { type: String, default: 'LOW' }
  }],
  assignedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResponseTeam' }],
  notes: { type: String, default: '' }
}, { timestamps: true });

evacuationPlanSchema.pre('save', function(next) {
  this.remainingCount = Math.max(0, this.populationRequiringEvacuation - this.evacuatedCount);
  this.progressPercent = this.populationRequiringEvacuation > 0
    ? Math.min(100, Math.round((this.evacuatedCount / this.populationRequiringEvacuation) * 100))
    : 0;
  if (this.progressPercent >= 100) {
    this.status = 'COMPLETED';
  }
  next();
});

module.exports = mongoose.model('EvacuationPlan', evacuationPlanSchema);
