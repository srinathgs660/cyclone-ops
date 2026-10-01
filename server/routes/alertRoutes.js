const express = require('express');
const router = express.Router();
const EmergencyAlert = require('../models/EmergencyAlert');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');

router.get('/', async (req, res, next) => {
  try {
    const alerts = await EmergencyAlert.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin', 'officer'), async (req, res, next) => {
  try {
    const count = await EmergencyAlert.countDocuments();
    const alertId = 'ALT-' + (count + 101);
    const alert = await EmergencyAlert.create({
      alertId,
      ...req.body,
      issuedBy: req.user._id,
      issuerName: req.user.name
    });
    emitEvent('alert:new', alert);
    res.status(201).json({ success: true, data: alert });
  } catch (err) { next(err); }
});

router.put('/:id/resolve', protect, authorize('admin', 'officer'), async (req, res, next) => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    emitEvent('alert:resolve', alert);
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
});

module.exports = router;
