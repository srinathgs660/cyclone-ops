const mongoose = require('mongoose');

const volunteerTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Ration Distribution', 'Tree & Road Clearing', 'First-Aid / Medical', 'Shelter Logistics', 'Elderly Assistance', 'Sandbagging & Flood Defense'],
    default: 'Shelter Logistics' 
  },
  priority: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM'], default: 'HIGH' },
  location: { type: String, required: true },
  district: { type: String, required: true },
  volunteersNeeded: { type: Number, default: 4 },
  volunteersAssigned: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    phone: String,
    status: { type: String, enum: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'], default: 'ACCEPTED' },
    acceptedAt: { type: Date, default: Date.now },
    completedAt: Date,
    proofNotes: String,
    proofPhotoUrl: String,
    proofPhotoPublicId: String
  }],
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'OPEN' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VolunteerTask', volunteerTaskSchema);
