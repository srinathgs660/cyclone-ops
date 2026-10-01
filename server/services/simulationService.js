const Cyclone = require('../models/Cyclone');
const RiskZone = require('../models/RiskZone');
const Shelter = require('../models/Shelter');
const Incident = require('../models/Incident');
const ResponseTeam = require('../models/ResponseTeam');
const Inventory = require('../models/Inventory');
const ReliefDistribution = require('../models/ReliefDistribution');
const EmergencyAlert = require('../models/EmergencyAlert');
const EvacuationPlan = require('../models/EvacuationPlan');
const { recalculateAllRisk } = require('./riskService');
const { emitEvent } = require('../sockets/socketManager');

// Scenario 1: Cyclone Approaching
const runCycloneApproachingScenario = async () => {
  const cyclone = await Cyclone.findOne({ status: 'ACTIVE' });
  if (!cyclone) throw new Error('No active cyclone found to simulate');

  cyclone.windSpeed = Math.min(240, cyclone.windSpeed + 25);
  cyclone.pressure = Math.max(920, cyclone.pressure - 12);
  if (cyclone.windSpeed >= 209) cyclone.category = 'Category 4';
  else if (cyclone.windSpeed >= 178) cyclone.category = 'Category 3';

  // Move cyclone closer to Chennai coast (80.27, 13.08)
  const currentLng = cyclone.currentLocation.coordinates[0];
  const currentLat = cyclone.currentLocation.coordinates[1];
  cyclone.currentLocation.coordinates = [
    Math.max(80.5, currentLng - 0.4),
    currentLat + 0.15
  ];
  cyclone.lastUpdated = new Date();
  await cyclone.save();

  const updatedZones = await recalculateAllRisk();

  const newAlert = await EmergencyAlert.create({
    alertId: 'ALT-SIM-' + Date.now().toString().slice(-4),
    title: 'CYCLONE INTENSIFICATION: ' + cyclone.name.toUpperCase() + ' REACHES ' + cyclone.category.toUpperCase(),
    type: 'CYCLONE WARNING',
    severity: 'CRITICAL',
    description: cyclone.name + ' has intensified to ' + cyclone.category + ' with sustained winds of ' + cyclone.windSpeed + ' km/h. Coastal sectors are placed under immediate red alert.',
    affectedRegions: cyclone.affectedRegions || ['Chennai Coastal Zone', 'Cuddalore', 'Kancheepuram'],
    targetAudience: 'ALL',
    active: true,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000)
  });

  emitEvent('cyclone:update', cyclone);
  emitEvent('alert:new', newAlert);

  return {
    scenario: 'Cyclone Approaching',
    cycloneName: cyclone.name,
    windSpeed: cyclone.windSpeed,
    category: cyclone.category,
    alertTitle: newAlert.title,
    affectedZonesUpdated: updatedZones.length
  };
};

// Scenario 2: Evacuation Surge
const runEvacuationSurgeScenario = async () => {
  const plan = await EvacuationPlan.findOne({ status: 'ACTIVE' }) || await EvacuationPlan.findOne({});
  if (!plan) throw new Error('No evacuation plan found');

  const surgeCount = 28000;
  plan.evacuatedCount = Math.min(plan.populationRequiringEvacuation, plan.evacuatedCount + surgeCount);
  plan.remainingCount = Math.max(0, plan.populationRequiringEvacuation - plan.evacuatedCount);
  plan.progressPercent = Math.min(100, Math.round((plan.evacuatedCount / plan.populationRequiringEvacuation) * 100));
  await plan.save();

  // Distribute refugees to shelters
  const shelters = await Shelter.find({ status: { '$ne': 'FULL' } }).limit(3);
  for (const s of shelters) {
    s.occupied = Math.min(s.totalCapacity, s.occupied + 650);
    s.available = Math.max(0, s.totalCapacity - s.occupied);
    s.occupancyPercent = Math.round((s.occupied / s.totalCapacity) * 100);
    if (s.occupancyPercent >= 95) s.status = 'FULL';
    else if (s.occupancyPercent >= 70) s.status = 'FILLING';
    await s.save();
    emitEvent('shelter:update', s);
  }

  emitEvent('evacuation:progress', plan);

  return {
    scenario: 'Evacuation Surge',
    zone: plan.zoneName,
    evacuatedTotal: plan.evacuatedCount,
    progressPercent: plan.progressPercent,
    remainingCount: plan.remainingCount
  };
};

// Scenario 3: Shelter Overcapacity
const runShelterOvercapacityScenario = async () => {
  const shelter = await Shelter.findOne({ status: 'FILLING' }) || await Shelter.findOne({ status: 'OPEN' });
  if (!shelter) throw new Error('No open shelter found');

  shelter.occupied = shelter.totalCapacity;
  shelter.available = 0;
  shelter.occupancyPercent = 100;
  shelter.status = 'FULL';
  await shelter.save();

  const backupShelter = await Shelter.findOne({ status: 'OPEN', _id: { '$ne': shelter._id } });

  const alert = await EmergencyAlert.create({
    alertId: 'ALT-SHL-' + Date.now().toString().slice(-4),
    title: 'SHELTER OVERCAPACITY WARNING: ' + shelter.name.toUpperCase(),
    type: 'SHELTER UPDATE',
    severity: 'WARNING',
    description: shelter.name + ' has reached 100% maximum capacity. Directing incoming convoys to backup facility: ' + (backupShelter ? backupShelter.name : 'Inland Sector Shelter C') + '.',
    affectedRegions: [shelter.district],
    targetAudience: 'ALL',
    active: true
  });

  emitEvent('shelter:update', shelter);
  emitEvent('alert:new', alert);

  return {
    scenario: 'Shelter Overcapacity',
    shelterName: shelter.name,
    status: shelter.status,
    backupRecommended: backupShelter ? backupShelter.name : 'Inland Relief Center'
  };
};

// Scenario 4: Citizen SOS Incident
const runCitizenSOSScenario = async () => {
  const incidentCount = await Incident.countDocuments();
  const incId = 'INC-' + (incidentCount + 101);

  const availableTeam = await ResponseTeam.findOne({ status: 'AVAILABLE', type: 'Search ' + '&' + ' Rescue' })
                     || await ResponseTeam.findOne({ status: 'AVAILABLE' });

  const incident = await Incident.create({
    incidentId: incId,
    title: 'Critical SOS: 14 Civilians Trapped in Rising Floodwaters',
    emergencyType: 'Trapped Civilians',
    location: {
      type: 'Point',
      coordinates: [80.2589, 13.0645] // Chennai Coastal Sector
    },
    address: 'Near Marina Coastal Lowlands, Kamarajar Salai',
    district: 'Chennai',
    severity: 'CRITICAL',
    priorityScore: 98,
    status: availableTeam ? 'ASSIGNED' : 'REPORTED',
    reportedName: 'Priya Sundaram (Citizen SOS)',
    reportedPhone: '+91 98401 23456',
    victimCount: 14,
    description: 'Ground floor submerged by storm surge. 4 children and 3 elderly citizens stranded on terrace. Immediate boat rescue needed.',
    assignedTeam: availableTeam ? availableTeam._id : null,
    assignedAt: availableTeam ? new Date() : null
  });

  if (availableTeam) {
    availableTeam.status = 'DISPATCHED';
    availableTeam.assignedIncident = incident._id;
    await availableTeam.save();
    emitEvent('response-team:update', availableTeam);
  }

  emitEvent('incident:new', incident);

  return {
    scenario: 'Citizen SOS Triage',
    incidentId: incident.incidentId,
    title: incident.title,
    severity: incident.severity,
    assignedTeam: availableTeam ? availableTeam.name : 'Dispatch Pending'
  };
};

// Scenario 5: Relief Shortage & Dispatch
const runReliefShortageScenario = async () => {
  const waterInventory = await Inventory.findOne({ itemType: 'Drinking Water' });
  if (waterInventory) {
    waterInventory.availableStock = 350; // Below critical threshold
    waterInventory.status = 'CRITICAL';
    await waterInventory.save();
    emitEvent('inventory:update', waterInventory);
  }

  const centralWarehouse = await Inventory.findOne({ warehouseName: { '$regex': /Central/i } });
  const targetShelter = await Shelter.findOne({ occupied: { '$gt': 500 } });

  const distribution = await ReliefDistribution.create({
    distributionId: 'DISP-' + Date.now().toString().slice(-4),
    itemType: 'Drinking Water',
    quantity: 12000,
    unit: 'Liters',
    originWarehouse: centralWarehouse ? centralWarehouse._id : null,
    warehouseName: centralWarehouse ? centralWarehouse.warehouseName : 'State Central Logistics Hub',
    destinationShelter: targetShelter ? targetShelter._id : null,
    destinationName: targetShelter ? targetShelter.name : 'Coastal Emergency Shelter A',
    priority: 'CRITICAL',
    deliveryStatus: 'IN_TRANSIT',
    dispatchedAt: new Date(),
    notes: 'Emergency inter-depot replenishment convoy dispatched with police escort.'
  });

  emitEvent('relief:update', distribution);

  return {
    scenario: 'Relief Shortage & Dispatch',
    itemType: distribution.itemType,
    dispatchedQuantity: distribution.quantity,
    origin: distribution.warehouseName,
    destination: distribution.destinationName,
    status: distribution.deliveryStatus
  };
};

module.exports = {
  runCycloneApproachingScenario,
  runEvacuationSurgeScenario,
  runShelterOvercapacityScenario,
  runCitizenSOSScenario,
  runReliefShortageScenario
};
