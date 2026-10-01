const EvacuationPlan = require('../models/EvacuationPlan');
const RiskZone = require('../models/RiskZone');
const Shelter = require('../models/Shelter');
const { emitEvent } = require('../sockets/socketManager');

const calculateEvacuationPriorities = async () => {
  const plans = await EvacuationPlan.find({})
    .populate('zone')
    .populate('targetShelters')
    .populate('assignedTeams');

  const rankedPlans = plans.map(p => {
    const risk = p.zone ? p.zone.riskScore : 50;
    const remainingRatio = p.populationRequiringEvacuation > 0
      ? (p.remainingCount / p.populationRequiringEvacuation)
      : 1;
    const roadAccess = p.zone ? p.zone.roadAccessibilityPercent : 80;

    const dynamicScore = Math.round(
      (risk * 0.45) +
      (remainingRatio * 100 * 0.35) +
      ((100 - roadAccess) * 0.20)
    );

    p.priorityScore = dynamicScore;
    return p;
  });

  rankedPlans.sort((a, b) => b.priorityScore - a.priorityScore);

  for (const plan of rankedPlans) {
    await plan.save();
  }

  return rankedPlans;
};

const updateEvacuationProgress = async (planId, evacuatedDelta) => {
  const plan = await EvacuationPlan.findById(planId);
  if (!plan) throw new Error('Evacuation Plan not found');

  plan.evacuatedCount = Math.min(plan.populationRequiringEvacuation, plan.evacuatedCount + evacuatedDelta);
  plan.remainingCount = Math.max(0, plan.populationRequiringEvacuation - plan.evacuatedCount);
  plan.progressPercent = Math.min(100, Math.round((plan.evacuatedCount / plan.populationRequiringEvacuation) * 100));

  if (plan.progressPercent >= 100) {
    plan.status = 'COMPLETED';
  } else if (plan.progressPercent > 0) {
    plan.status = 'ACTIVE';
  }

  await plan.save();

  emitEvent('evacuation:progress', {
    planId: plan._id,
    zoneName: plan.zoneName,
    evacuatedCount: plan.evacuatedCount,
    remainingCount: plan.remainingCount,
    progressPercent: plan.progressPercent,
    status: plan.status
  });

  return plan;
};

module.exports = {
  calculateEvacuationPriorities,
  updateEvacuationProgress
};
