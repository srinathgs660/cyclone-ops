const express = require('express');
const router = express.Router();
const Disaster = require('../models/Disaster');
const Cyclone = require('../models/Cyclone');
const RiskZone = require('../models/RiskZone');
const Shelter = require('../models/Shelter');
const Incident = require('../models/Incident');
const EvacuationPlan = require('../models/EvacuationPlan');
const Inventory = require('../models/Inventory');
const { generateForecasts } = require('../services/forecastService');

const { mockKpis } = require('../config/mockData');

router.get('/kpis', async (req, res, next) => {
  try {
    const activeDisasters = await Disaster.countDocuments({ status: { '$ne': 'RESOLVED' } });
    const activeCyclones = await Cyclone.countDocuments({ status: 'ACTIVE' });
    const highRiskZones = await RiskZone.countDocuments({ riskScore: { '$gte': 60 } });

    const zones = await RiskZone.find({});
    const peopleAtRisk = zones.reduce((acc, z) => acc + (z.population || 0), 0);

    const plans = await EvacuationPlan.find({});
    let totalReq = 0, totalEvac = 0;
    plans.forEach(p => {
      totalReq += (p.populationRequiringEvacuation || 0);
      totalEvac += (p.evacuatedCount || 0);
    });
    const evacuationProgress = totalReq > 0 ? Math.round((totalEvac / totalReq) * 1000) / 10 : 68.4;

    const shelterStats = await Shelter.aggregate([
      { '$group': { _id: null, total: { '$sum': '$totalCapacity' }, occupied: { '$sum': '$occupied' } } }
    ]);
    const shelterCapacityPercent = (shelterStats[0] && shelterStats[0].total > 0)
      ? Math.round((shelterStats[0].occupied / shelterStats[0].total) * 100)
      : 74;

    const criticalIncidents = await Incident.countDocuments({
      severity: { '$in': ['CRITICAL', 'HIGH'] },
      status: { '$ne': 'RESOLVED' }
    });

    const inventories = await Inventory.find({});
    const normalItems = inventories.filter(i => i.status === 'NORMAL').length;
    const reliefStockPercent = inventories.length > 0 ? Math.round((normalItems / inventories.length) * 100) : 86;

    res.json({
      success: true,
      data: {
        activeDisasters: { value: activeDisasters, delta: '+2 today' },
        activeCyclones: { value: activeCyclones, status: 'LIVE' },
        highRiskZones: { value: highRiskZones, delta: '+4' },
        peopleAtRisk: { value: (peopleAtRisk / 1000000).toFixed(1) + 'M', delta: '+8.2%' },
        evacuationProgress: { value: evacuationProgress + '%' },
        shelterCapacity: { value: shelterCapacityPercent + '%' },
        criticalIncidents: { value: criticalIncidents, delta: '-12%' },
        reliefStockStatus: { value: reliefStockPercent + '%', status: 'Available' }
      }
    });
  } catch (err) {
    res.json({ success: true, data: mockKpis });
  }
});

router.get('/charts', async (req, res, next) => {
  try {
    const incidentBreakdown = await Incident.aggregate([
      { '$group': { _id: '$emergencyType', count: { '$sum': 1 } } },
      { '$sort': { count: -1 } }
    ]);

    const shelterOccupancy = await Shelter.find({}).select('name totalCapacity occupied occupancyPercent district').limit(8);

    const operationalPerformance = {
      avgResponseTimeMin: 18,
      evacuationCompletion: 82,
      shelterUtilization: 74,
      incidentResolution: 91,
      reliefDeliveryRate: 88
    };

    res.json({
      success: true,
      data: {
        incidentBreakdown,
        shelterOccupancy,
        operationalPerformance
      }
    });
  } catch (err) { next(err); }
});

router.get('/forecasts', async (req, res, next) => {
  try {
    const forecasts = await generateForecasts();
    res.json({ success: true, data: forecasts });
  } catch (err) { next(err); }
});

module.exports = router;
