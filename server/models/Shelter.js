const mongoose = require('mongoose');
const { SHELTER_STATUS } = require('../config/constants');

const shelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, default: 'Tamil Nadu' },
  totalCapacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  occupancyPercent: { type: Number, default: 0 },
  status: {
    type: String,
    enum: Object.values(SHELTER_STATUS),
    default: SHELTER_STATUS.OPEN
  },
  facilities: {
    drinkingWater: { type: Boolean, default: true },
    foodSupplies: { type: Boolean, default: true },
    medicalSupport: { type: Boolean, default: true },
    electricity: { type: Boolean, default: true },
    toilets: { type: Boolean, default: true },
    womenChildrenSupport: { type: Boolean, default: true },
    accessibilityRamps: { type: Boolean, default: true },
    backupGenerators: { type: Boolean, default: true }
  },
  contactPerson: { type: String, default: 'Facility Manager' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  managerAgency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' }
}, { timestamps: true });

shelterSchema.index({ location: '2dsphere' });
shelterSchema.index({ district: 1, status: 1 });

shelterSchema.pre('save', function(next) {
  this.available = Math.max(0, this.totalCapacity - this.occupied);
  this.occupancyPercent = this.totalCapacity > 0
    ? Math.min(100, Math.round((this.occupied / this.totalCapacity) * 100))
    : 0;
  if (this.occupancyPercent >= 100) {
    this.status = SHELTER_STATUS.FULL;
  } else if (this.occupancyPercent >= 70 && this.status === SHELTER_STATUS.OPEN) {
    this.status = SHELTER_STATUS.FILLING;
  }
  next();
});

module.exports = mongoose.model('Shelter', shelterSchema);
