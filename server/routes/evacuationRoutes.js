const express = require('express');
const router = express.Router();
const EvacuationPlan = require('../models/EvacuationPlan');
const { calculateEvacuationPriorities, updateEvacuationProgress } = require('../services/evacuationService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const { mockEvacuations } = require('../config/mockData');

router.get('/', async (req, res, next) => {
  try {
    const plans = await EvacuationPlan.find({})
      .populate('zone')
      .populate('targetShelters')
      .populate('assignedTeams')
      .sort({ priorityScore: -1 });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    res.json({ success: true, count: mockEvacuations.length, data: mockEvacuations });
  }
});

router.get('/priority', async (req, res, next) => {
  try {
    const ranked = await calculateEvacuationPriorities();
    res.json({ success: true, count: ranked.length, data: ranked });
  } catch (err) { next(err); }
});

router.put('/:id/progress', protect, authorize('admin', 'officer', 'responder'), async (req, res, next) => {
  try {
    const { evacuatedDelta } = req.body;
    const plan = await updateEvacuationProgress(req.params.id, Number(evacuatedDelta || 0));
    res.json({ success: true, message: 'Evacuation progress updated', data: plan });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { title, zoneName, populationRequiringEvacuation, priorityScore, routes, notes } = req.body;
    let zoneId = req.body.zone;
    
    // Auto-resolve or create dummy zone if not provided
    if (!zoneId) {
      const RiskZone = require('../models/RiskZone');
      const foundZone = await RiskZone.findOne({ name: new RegExp(zoneName, 'i') });
      if (foundZone) {
        zoneId = foundZone._id;
      } else {
        const dummyZone = await RiskZone.create({
          name: zoneName || 'Coastal Sector',
          riskScore: priorityScore || 80,
          population: populationRequiringEvacuation || 50000,
          polygon: {
            type: 'Polygon',
            coordinates: [[[80.20, 13.00], [80.30, 13.00], [80.30, 13.15], [80.20, 13.15], [80.20, 13.00]]]
          }
        });
        zoneId = dummyZone._id;
      }
    }

    const plan = await EvacuationPlan.create({
      title,
      zone: zoneId,
      zoneName,
      populationRequiringEvacuation: Number(populationRequiringEvacuation || 10000),
      priorityScore: Number(priorityScore || 80),
      routes: routes || [
        { name: 'Primary Evacuation Expressway', distanceKm: 12, estimatedDurationMin: 25, roadStatus: 'CLEAR' }
      ],
      notes: notes || ''
    });

    const { emitEvent } = require('../sockets/socketManager');
    emitEvent('evacuation:new', plan);

    res.status(201).json({ success: true, message: 'Evacuation plan created', data: plan });
  } catch (err) { next(err); }
});

module.exports = router;
