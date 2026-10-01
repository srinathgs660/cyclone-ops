const mongoose = require('mongoose');

const forecastPointSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  coordinates: { type: [Number], required: true },
  windSpeed: { type: Number, required: true },
  pressure: { type: Number, required: true },
  category: { type: String, required: true },
  uncertaintyRadiusKm: { type: Number, default: 45 }
}, { _id: false });

const cycloneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  source: { type: String, default: 'IMD / JTWC' },
  externalId: { type: String, index: true },
  category: { type: String, required: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  windSpeed: { type: Number, required: true },
  windSpeedUnit: { type: String, default: 'km/h' },
  pressure: { type: Number, required: true },
  movementSpeed: { type: Number, required: true },
  movementDirection: { type: String, required: true },
  pastTrack: [{
    time: { type: Date },
    coordinates: { type: [Number] },
    windSpeed: { type: Number },
    pressure: { type: Number }
  }],
  forecastTrack: [forecastPointSchema],
  affectedRegions: [{ type: String }],
  status: {
    type: String,
    enum: ['ACTIVE', 'LANDFALL', 'DEGRADING', 'DISSIPATED'],
    default: 'ACTIVE'
  },
  landfallEstimate: {
    time: { type: Date },
    locationName: { type: String },
    coordinates: { type: [Number] },
    confidence: { type: String, default: 'HIGH' }
  },
  intensityRadius: {
    galeWindKm: { type: Number, default: 180 },
    stormWindKm: { type: Number, default: 90 },
    hurricaneWindKm: { type: Number, default: 45 }
  },
  startTime: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  sourceUrl: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

cycloneSchema.index({ currentLocation: '2dsphere' });
cycloneSchema.index({ status: 1 });

module.exports = mongoose.model('Cyclone', cycloneSchema);
