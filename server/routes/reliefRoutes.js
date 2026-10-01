const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const ReliefDistribution = require('../models/ReliefDistribution');
const { calculateReliefRequirements } = require('../services/reliefOptimizerService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');

router.get('/inventory', async (req, res, next) => {
  try {
    const items = await Inventory.find({}).sort({ status: 1, availableStock: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
});

router.post('/inventory', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { warehouseName, district, itemType, totalStock, unit, minThreshold, coordinates } = req.body;
    const inv = await Inventory.create({
      warehouseName: warehouseName || 'Central Logistics Hub',
      district: district || 'Chennai',
      itemType,
      totalStock: Number(totalStock || 1000),
      availableStock: Number(totalStock || 1000),
      reservedStock: 0,
      unit: unit || 'Kits',
      minThreshold: Number(minThreshold || 500),
      warehouseLocation: {
        type: 'Point',
        coordinates: coordinates || [80.24, 13.06]
      }
    });

    emitEvent('inventory:new', inv);
    res.status(201).json({ success: true, message: 'Resource inventory added successfully', data: inv });
  } catch (err) { next(err); }
});

router.get('/distributions', async (req, res, next) => {
  try {
    const disps = await ReliefDistribution.find({})
      .populate('originWarehouse')
      .populate('assignedTeam')
      .sort({ dispatchedAt: -1 });
    res.json({ success: true, count: disps.length, data: disps });
  } catch (err) { next(err); }
});

router.post('/distributions', protect, authorize('admin', 'officer', 'coordinator'), async (req, res, next) => {
  try {
    const count = await ReliefDistribution.countDocuments();
    const distributionId = 'DISP-' + (count + 1001);
    const disp = await ReliefDistribution.create({
      distributionId,
      ...req.body,
      dispatchedAt: new Date()
    });

    // If an assigned team was selected, update team status to DISPATCHED
    if (req.body.assignedTeam) {
      const ResponseTeam = require('../models/ResponseTeam');
      await ResponseTeam.findByIdAndUpdate(req.body.assignedTeam, {
        status: 'DISPATCHED'
      });
    }

    emitEvent('relief:update', disp);
    res.status(201).json({ success: true, data: disp });
  } catch (err) { next(err); }
});

router.put('/distributions/:id', protect, authorize('admin', 'officer', 'coordinator', 'responder'), async (req, res, next) => {
  try {
    const disp = await ReliefDistribution.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!disp) return res.status(404).json({ success: false, message: 'Distribution not found' });
    if (req.body.deliveryStatus === 'DELIVERED') {
      disp.deliveredAt = new Date();
      await disp.save();
    }
    emitEvent('relief:update', disp);
    res.json({ success: true, data: disp });
  } catch (err) { next(err); }
});

router.get('/recommendations', async (req, res, next) => {
  try {
    const recs = await calculateReliefRequirements();
    res.json({ success: true, data: recs });
  } catch (err) { next(err); }
});

module.exports = router;
