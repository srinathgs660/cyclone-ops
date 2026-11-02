const express = require('express');
const router = express.Router();
const RiskZone = require('../models/RiskZone');
const { recalculateAllRisk } = require('../services/riskService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const { mockRiskZones } = require('../config/mockData');

router.get('/zones', async (req, res, next) => {
  try {
    let zones = await RiskZone.find({}).sort({ riskScore: -1 });
    if (!zones || zones.length === 0) {
      zones = mockRiskZones;
    }
    res.json({ success: true, count: zones.length, data: zones });
  } catch (err) {
    res.json({ success: true, count: mockRiskZones.length, data: mockRiskZones });
  }
});

router.get('/zones/:id', async (req, res, next) => {
  try {
    const zone = await RiskZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    res.json({ success: true, data: zone });
  } catch (err) { next(err); }
});

router.get('/assessment', async (req, res, next) => {
  try {
    let zones = [];
    try {
      zones = await RiskZone.find({}).sort({ riskScore: -1 });
    } catch (dbErr) {
      zones = [];
    }
    if (!zones || zones.length === 0) {
      zones = mockRiskZones;
    }
    const stats = {
      critical: zones.filter(z => z.riskLevel === 'CRITICAL').length,
      veryHigh: zones.filter(z => z.riskLevel === 'VERY_HIGH').length,
      high: zones.filter(z => z.riskLevel === 'HIGH').length,
      moderate: zones.filter(z => z.riskLevel === 'MODERATE').length,
      low: zones.filter(z => z.riskLevel === 'LOW').length,
      totalPopulationAtRisk: zones.reduce((acc, z) => acc + (z.population || 0), 0),
      totalVulnerable: zones.reduce((acc, z) => acc + (z.vulnerablePopulation || 0), 0)
    };
    res.json({ success: true, stats, zones });
  } catch (err) {
    const zones = mockRiskZones;
    const stats = {
      critical: zones.filter(z => z.riskLevel === 'CRITICAL').length,
      veryHigh: zones.filter(z => z.riskLevel === 'VERY_HIGH').length,
      high: zones.filter(z => z.riskLevel === 'HIGH').length,
      moderate: zones.filter(z => z.riskLevel === 'MODERATE').length,
      low: zones.filter(z => z.riskLevel === 'LOW').length,
      totalPopulationAtRisk: zones.reduce((acc, z) => acc + (z.population || 0), 0),
      totalVulnerable: zones.reduce((acc, z) => acc + (z.vulnerablePopulation || 0), 0)
    };
    res.json({ success: true, stats, zones });
  }
});

router.post('/recalculate', async (req, res, next) => {
  try {
    const updated = await recalculateAllRisk();
    res.json({ success: true, message: 'Risk assessment recalculated across all zones', count: updated.length });
  } catch (err) { next(err); }
});

module.exports = router;
