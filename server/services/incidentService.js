const Incident = require('../models/Incident');
const ResponseTeam = require('../models/ResponseTeam');
const { INCIDENT_PRIORITY, INCIDENT_STATUS, TEAM_STATUS } = require('../config/constants');
const { calculateDistanceKm } = require('./riskService');
const { emitEvent } = require('../sockets/socketManager');

const calculateIncidentPriority = (emergencyType, victimCount = 1) => {
  let score = 50;
  let severity = INCIDENT_PRIORITY.MEDIUM;

  if (emergencyType.includes('Trapped')) {
    score = 95;
    severity = INCIDENT_PRIORITY.CRITICAL;
  } else if (emergencyType.includes('Medical')) {
    score = 85;
    severity = INCIDENT_PRIORITY.CRITICAL;
  } else if (emergencyType.includes('Flooding')) {
    score = 75;
    severity = INCIDENT_PRIORITY.HIGH;
  } else if (emergencyType.includes('Building')) {
    score = 70;
    severity = INCIDENT_PRIORITY.HIGH;
  } else if (emergencyType.includes('Road')) {
    score = 45;
    severity = INCIDENT_PRIORITY.MEDIUM;
  } else {
    score = 35;
    severity = INCIDENT_PRIORITY.LOW;
  }

  if (victimCount > 10) score = Math.min(100, score + 15);
  else if (victimCount > 3) score = Math.min(100, score + 8);

  return { priorityScore: score, severity };
};

const findBestResponseTeam = async (incidentCoords, emergencyType) => {
  let targetType = 'Search ' + '&' + ' Rescue';
  if (emergencyType.includes('Medical')) targetType = 'Medical Response';
  else if (emergencyType.includes('Building') || emergencyType.includes('Road')) targetType = 'Engineering ' + '&' + ' Debris';

  let teams = await ResponseTeam.find({
    status: TEAM_STATUS.AVAILABLE,
    type: targetType
  });

  if (!teams || teams.length === 0) {
    teams = await ResponseTeam.find({ status: TEAM_STATUS.AVAILABLE });
  }

  if (!teams || teams.length === 0) return null;

  const withDist = teams.map(t => ({
    team: t,
    distanceKm: calculateDistanceKm(incidentCoords, t.currentLocation.coordinates)
  }));

  withDist.sort((a, b) => a.distanceKm - b.distanceKm);
  return withDist[0].team;
};

module.exports = {
  calculateIncidentPriority,
  findBestResponseTeam
};
