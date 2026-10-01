const express = require('express');
const router = express.Router();
const Cyclone = require('../models/Cyclone');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');
const { syncGlobalCyclones, getLiveCyclones, getLastSyncTime } = require('../services/liveCycloneService');

/**
 * GET /api/cyclones/live-global
 * Returns all active worldwide tropical cyclones (strictly verified real-time)
 */
router.get('/live-global', async (req, res, next) => {
  try {
    const { basin } = req.query;
    let cyclones = getLiveCyclones(basin);
    if (!cyclones || cyclones.length === 0) {
      cyclones = await syncGlobalCyclones();
      if (basin && basin !== 'all' && basin !== 'global') {
        cyclones = getLiveCyclones(basin);
      }
    }
    res.json({
      success: true,
      count: cyclones.length,
      lastSyncTime: getLastSyncTime(),
      sources: ['NOAA NHC', 'NASA EONET', 'IMD RSMC / JTWC'],
      data: cyclones
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cyclones/sync-live
 * Triggers on-demand real-time satellite polling and Socket.IO broadcast
 */
router.post('/sync-live', async (req, res, next) => {
  try {
    const cyclones = await syncGlobalCyclones();
    res.json({
      success: true,
      message: 'Global meteorological satellites polled successfully',
      count: cyclones.length,
      lastSyncTime: getLastSyncTime(),
      data: cyclones
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/cyclones/active
 * Returns ONLY currently active real-time ongoing cyclones (no past/finished storms)
 */
router.get('/active', async (req, res, next) => {
  try {
    const { basin } = req.query;
    let liveGlobal = getLiveCyclones(basin);

    if (!liveGlobal || liveGlobal.length === 0) {
      liveGlobal = await syncGlobalCyclones();
      if (basin && basin !== 'all' && basin !== 'global') {
        liveGlobal = getLiveCyclones(basin);
      }
    }

    res.json({
      success: true,
      count: liveGlobal.length,
      lastSyncTime: getLastSyncTime(),
      data: liveGlobal
    });
  } catch (err) {
    const live = getLiveCyclones();
    res.json({ success: true, count: live.length, data: live });
  }
});

router.get('/', async (req, res, next) => {
  try {
    const cyclones = getLiveCyclones();
    res.json({ success: true, count: cyclones.length, data: cyclones });
  } catch (err) {
    res.json({ success: true, count: 0, data: [] });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const liveMatch = getLiveCyclones().find(c => 
      c._id === id || 
      c.externalId === id || 
      c.name.toLowerCase() === id.toLowerCase()
    );
    if (liveMatch) {
      return res.json({ success: true, data: liveMatch });
    }

    const cyclone = await Cyclone.findById(id);
    if (!cyclone) return res.status(404).json({ success: false, message: 'Cyclone not found' });
    res.json({ success: true, data: cyclone });
  } catch (err) {
    const liveMatch = getLiveCyclones().find(c => c._id === req.params.id);
    if (liveMatch) return res.json({ success: true, data: liveMatch });
    next(err);
  }
});

router.get('/:id/track', async (req, res, next) => {
  try {
    const liveMatch = getLiveCyclones().find(c => c._id === req.params.id);
    if (liveMatch) {
      return res.json({
        success: true,
        currentLocation: liveMatch.currentLocation,
        pastTrack: liveMatch.pastTrack,
        forecastTrack: liveMatch.forecastTrack,
        landfallEstimate: liveMatch.landfallEstimate,
        intensityRadius: liveMatch.intensityRadius
      });
    }

    const cyclone = await Cyclone.findById(req.params.id);
    if (!cyclone) return res.status(404).json({ success: false, message: 'Cyclone not found' });
    res.json({
      success: true,
      currentLocation: cyclone.currentLocation,
      pastTrack: cyclone.pastTrack,
      forecastTrack: cyclone.forecastTrack,
      landfallEstimate: cyclone.landfallEstimate,
      intensityRadius: cyclone.intensityRadius
    });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin', 'officer'), async (req, res, next) => {
  try {
    const cyclone = await Cyclone.create(req.body);
    emitEvent('cyclone:update', cyclone);
    res.status(201).json({ success: true, data: cyclone });
  } catch (err) { next(err); }
});

router.put('/:id', protect, authorize('admin', 'officer'), async (req, res, next) => {
  try {
    const cyclone = await Cyclone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cyclone) return res.status(404).json({ success: false, message: 'Cyclone not found' });
    emitEvent('cyclone:update', cyclone);
    res.json({ success: true, data: cyclone });
  } catch (err) { next(err); }
});

module.exports = router;
