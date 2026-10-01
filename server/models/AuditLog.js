const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'system' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '127.0.0.1' },
  status: { type: String, enum: ['SUCCESS', 'FAILURE', 'WARNING'], default: 'SUCCESS' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

auditLogSchema.index({ module: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
