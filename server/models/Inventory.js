const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  warehouseName: { type: String, required: true },
  warehouseLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  district: { type: String, required: true },
  itemType: {
    type: String,
    required: true,
    enum: [
      'Drinking Water',
      'Food Kits',
      'Medical Kits',
      'Blankets',
      'Emergency Tents',
      'Fuel (Diesel/Petrol)',
      'Clothing & Hygiene',
      'Satellite Radios'
    ]
  },
  totalStock: { type: Number, required: true, default: 0 },
  availableStock: { type: Number, required: true, default: 0 },
  reservedStock: { type: Number, default: 0 },
  unit: { type: String, required: true },
  minThreshold: { type: Number, default: 500 },
  status: {
    type: String,
    enum: ['NORMAL', 'LOW', 'CRITICAL', 'OUT_OF_STOCK'],
    default: 'NORMAL'
  },
  lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

inventorySchema.index({ warehouseLocation: '2dsphere' });
inventorySchema.index({ itemType: 1, status: 1 });

inventorySchema.pre('save', function(next) {
  this.availableStock = Math.max(0, this.totalStock - this.reservedStock);
  if (this.availableStock === 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.availableStock <= this.minThreshold * 0.3) {
    this.status = 'CRITICAL';
  } else if (this.availableStock <= this.minThreshold) {
    this.status = 'LOW';
  } else {
    this.status = 'NORMAL';
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
