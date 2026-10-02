const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.CITIZEN
  },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
  phone: { type: String, default: '' },
  district: { type: String, default: 'Coastal Sector' },
  skills: [{ type: String }],
  availability: {
    type: String,
    enum: ['available', 'assigned', 'on-duty', 'standby'],
    default: 'available'
  },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseTeam' },
  assignedTask: {
    taskId: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    priority: { type: String, default: 'Medium' },
    location: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'In-Progress', 'Completed'], default: 'Pending' },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: String, default: 'EOC Administrator' }
  },
  assignedLogistics: {
    warehouse: { type: String, default: '' },
    destinationShelter: { type: String, default: '' },
    supplies: [{ item: String, quantity: Number, unit: String }],
    instructions: { type: String, default: '' },
    status: { type: String, enum: ['Allocated', 'In-Transit', 'Delivered'], default: 'Allocated' },
    assignedAt: { type: Date, default: Date.now }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [80.2707, 13.0827] }
  },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, name: this.name, email: this.email, role: this.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
