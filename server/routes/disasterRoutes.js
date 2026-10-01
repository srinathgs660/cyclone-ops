const express = require('express');
const router = express.Router();
const Disaster = require('../models/Disaster');
const { syncExternalDisasters } = require('../services/disasterAggregator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', async (req, res, next) => {
  try {
    const { type, severity, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    const disasters = await Disaster.find(filter).sort({ startTime: -1 });
    res.json({ success: true, count: disasters.length, data: disasters });
  } catch (err) { next(err); }
});

router.get('/active', async (req, res, next) => {
  try {
    const active = await Disaster.find({ status: { '$ne': 'RESOLVED' } }).sort({ riskScore: -1 });
    res.json({ success: true, count: active.length, data: active });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const disaster = await Disaster.findById(req.params.id);
    if (!disaster) return res.status(404).json({ success: false, message: 'Disaster not found' });
    res.json({ success: true, data: disaster });
  } catch (err) { next(err); }
});

router.post('/sync', protect, authorize('admin', 'officer'), async (req, res, next) => {
  try {
    const result = await syncExternalDisasters();
    res.json({ success: true, message: 'Disaster feed synchronized successfully', data: result });
  } catch (err) { next(err); }
});

module.exports = router;
