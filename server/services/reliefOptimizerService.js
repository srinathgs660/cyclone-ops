const Inventory = require('../models/Inventory');
const RiskZone = require('../models/RiskZone');
const Shelter = require('../models/Shelter');
const ReliefDistribution = require('../models/ReliefDistribution');
const { emitEvent } = require('../sockets/socketManager');

const calculateReliefRequirements = async () => {
  const zones = await RiskZone.find({ riskScore: { '$gte': 40 } });
  const shelters = await Shelter.find({ occupied: { '$gt': 0 } });

  let totalPeopleAtRisk = 0;
  zones.forEach(z => totalPeopleAtRisk += (z.population || 0));

  let totalShelteredPeople = 0;
  shelters.forEach(s => totalShelteredPeople += (s.occupied || 0));

  const totalBeneficiaries = Math.max(totalShelteredPeople, Math.round(totalPeopleAtRisk * 0.4));

  // Rations per day
  const dailyDemands = {
    waterLiters: totalBeneficiaries * 3,
    foodKits: Math.round(totalBeneficiaries * 0.5),
    medicalKits: Math.round(totalBeneficiaries / 40),
    blankets: Math.round(totalBeneficiaries * 0.5)
  };

  const inventories = await Inventory.find({});
  const stockLevels = {};
  inventories.forEach(inv => {
    if (!stockLevels[inv.itemType]) stockLevels[inv.itemType] = 0;
    stockLevels[inv.itemType] += inv.availableStock;
  });

  const recommendations = [];

  for (const zone of zones) {
    const zoneBeneficiaries = Math.round(zone.population * (zone.riskScore / 100) * 0.3);
    if (zoneBeneficiaries > 0) {
      recommendations.push({
        zoneId: zone._id,
        zoneName: zone.name,
        riskScore: zone.riskScore,
        priority: zone.riskScore > 75 ? 'CRITICAL' : 'HIGH',
        requirements: {
          waterLiters: zoneBeneficiaries * 3,
          foodKits: Math.round(zoneBeneficiaries * 0.5),
          medicalKits: Math.round(zoneBeneficiaries / 40)
        },
        rationale: 'High population density (' + zone.population.toLocaleString() + ') in proximity to storm swath'
      });
    }
  }

  recommendations.sort((a, b) => b.riskScore - a.riskScore);

  return {
    totalBeneficiaries,
    dailyDemands,
    stockLevels,
    recommendations: recommendations.slice(0, 5)
  };
};

module.exports = {
  calculateReliefRequirements
};
