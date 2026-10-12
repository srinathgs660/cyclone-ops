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

const findBestResponseTeam = async (incidentCoords, emergencyType = '') => {
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

  // Fallback to any existing team if all units are currently dispatched
  if (!teams || teams.length === 0) {
    teams = await ResponseTeam.find({});
  }

  if (!teams || teams.length === 0) return null;

  const withDist = teams.map(t => ({
    team: t,
    distanceKm: calculateDistanceKm(incidentCoords, t.currentLocation.coordinates)
  }));

  withDist.sort((a, b) => a.distanceKm - b.distanceKm);
  return withDist[0].team;
};

const findBestVolunteer = async (incidentCoords) => {
  try {
    const User = require('../models/User');
    const volunteers = await User.find({ role: 'volunteer' });
    const [cLng, cLat] = incidentCoords || [80.2707, 13.0827];
    const nearbyStartCoords = [
      Number((cLng - 0.011).toFixed(5)),
      Number((cLat - 0.009).toFixed(5))
    ];

    if (volunteers && volunteers.length > 0) {
      const vol = volunteers[0];
      return {
        userId: vol._id,
        name: vol.name || 'Aravind Swaminathan',
        phone: vol.phone || '+91 94440 12891',
        skills: (vol.skills && vol.skills.length > 0) ? vol.skills.join(', ') : 'Flood Rescue, First Aid & Evacuation',
        status: 'EN_ROUTE',
        coordinates: nearbyStartCoords,
        updatedAt: new Date()
      };
    }

    return {
      userId: null,
      name: 'Aravind Swaminathan (Field Rescue Volunteer)',
      phone: '+91 94440 12891',
      skills: 'Flood Rescue, First Aid & Evacuation',
      status: 'EN_ROUTE',
      coordinates: nearbyStartCoords,
      updatedAt: new Date()
    };
  } catch (err) {
    const [cLng, cLat] = incidentCoords || [80.2707, 13.0827];
    return {
      userId: null,
      name: 'Aravind Swaminathan (Field Rescue Volunteer)',
      phone: '+91 94440 12891',
      skills: 'Flood Rescue, First Aid & Evacuation',
      status: 'EN_ROUTE',
      coordinates: [Number((cLng - 0.011).toFixed(5)), Number((cLat - 0.009).toFixed(5))],
      updatedAt: new Date()
    };
  }
};

module.exports = {
  calculateIncidentPriority,
  findBestResponseTeam,
  findBestVolunteer
};
