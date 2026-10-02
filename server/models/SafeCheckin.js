const mongoose = require('mongoose');

const safeCheckinSchema = new mongoose.Schema({
  citizenName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  shelterName: { type: String, required: true },
  district: { type: String, required: true },
  familyMembersCount: { type: Number, default: 1 },
  familyMembersNames: [{ type: String }],
  medicalAssistanceRequired: { type: Boolean, default: false },
  status: { type: String, default: 'SAFE_IN_SHELTER', enum: ['SAFE_IN_SHELTER', 'EVACUATING', 'SAFE_AT_RELATIVE'] },
  notes: { type: String },
  qrCodeData: { type: String },
  createdAt: { type: Date, default: Date.now }
});

safeCheckinSchema.index({ phone: 1, citizenName: 'text' });

module.exports = mongoose.model('SafeCheckin', safeCheckinSchema);
