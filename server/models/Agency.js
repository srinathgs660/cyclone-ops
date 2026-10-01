const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['GOVERNMENT', 'MILITARY', 'RESCUE', 'MEDICAL', 'NGO', 'VOLUNTEER_GROUP'],
    default: 'GOVERNMENT'
  },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  coverageRegions: [{ type: String }],
  headquarters: { type: String, default: '' },
  activeTeamsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);
