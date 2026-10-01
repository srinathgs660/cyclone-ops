const mongoose = require('mongoose');

const reliefDistributionSchema = new mongoose.Schema({
  distributionId: { type: String, required: true, unique: true },
  itemType: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  originWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  warehouseName: { type: String, default: 'Central Logistics Hub' },
  destinationZone: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskZone' },
  destinationShelter: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  destinationName: { type: String, required: true },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'HIGH'
  },
  assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'ResponseTeam' },
  deliveryStatus: {
    type: String,
    enum: ['PENDING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },
  notes: { type: String, default: '' }
}, { timestamps: true });

reliefDistributionSchema.index({ deliveryStatus: 1, priority: 1 });

module.exports = mongoose.model('ReliefDistribution', reliefDistributionSchema);
