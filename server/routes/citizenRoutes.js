const express = require('express');
const router = express.Router();
const AssistanceRequest = require('../models/AssistanceRequest');
const Incident = require('../models/Incident');
const Cyclone = require('../models/Cyclone');
const Shelter = require('../models/Shelter');
const { calculateDistanceKm } = require('../services/riskService');
const { findBestResponseTeam } = require('../services/incidentService');
const { findNearestShelters } = require('../services/shelterService');
const { emitEvent } = require('../sockets/socketManager');

// POST /api/citizen/sos
router.post('/sos', async (req, res, next) => {
  try {
    const { fullName, contactPhone, emergencyType, coordinates, address, peopleCount, description } = req.body;
    if (!coordinates || !coordinates.length) return res.status(400).json({ success: false, message: 'Coordinates are required for emergency dispatch' });

    const incCount = await Incident.countDocuments();
    const incidentId = 'SOS-' + (incCount + 101);

    const autoTeam = await findBestResponseTeam(coordinates, emergencyType || 'Trapped');

    const incident = await Incident.create({
      incidentId,
      title: 'CITIZEN SOS: ' + (fullName || 'Emergency Request') + ' (' + (emergencyType || 'General') + ')',
      emergencyType: emergencyType || 'Trapped Civilians',
      location: { type: 'Point', coordinates },
      address: address || 'Reported via Citizen Emergency App',
      victimCount: Number(peopleCount || 1),
      description: description || 'Citizen pressed emergency SOS',
      priorityScore: 95,
      severity: 'CRITICAL',
      status: autoTeam ? 'ASSIGNED' : 'REPORTED',
      reporterName: fullName || 'Citizen',
      reporterPhone: contactPhone || '',
      assignedTeam: autoTeam ? autoTeam._id : null,
      assignedAt: autoTeam ? new Date() : null
    });

    const request = await AssistanceRequest.create({
      fullName: fullName || 'Citizen',
      contactPhone: contactPhone || '911',
      emergencyType: emergencyType || 'Trapped',
      location: { type: 'Point', coordinates },
      address: address || '',
      peopleCount: Number(peopleCount || 1),
      description: description || '',
      priority: 'CRITICAL',
      status: autoTeam ? 'TEAM_DISPATCHED' : 'TRIAGED',
      assignedIncident: incident._id
    });

    if (autoTeam) {
      autoTeam.status = 'DISPATCHED';
      autoTeam.assignedIncident = incident._id;
      await autoTeam.save();
      emitEvent('response-team:update', autoTeam);
    }

    emitEvent('incident:new', incident);
    emitEvent('sos:broadcast', {
      id: request._id,
      incidentId: incident.incidentId,
      fullName: request.fullName,
      victimCount: request.peopleCount,
      coordinates,
      emergencyType: request.emergencyType
    });

    res.status(201).json({
      success: true,
      message: 'SOS Signal received and triaged. Emergency teams have been dispatched.',
      incidentId: incident.incidentId,
      assignedTeam: autoTeam ? autoTeam.name : 'Central Dispatching Unit'
    });
  } catch (err) { next(err); }
});

// GET /api/citizen/risk-check
router.get('/risk-check', async (req, res, next) => {
  try {
    const lng = parseFloat(req.query.lng || 80.27);
    const lat = parseFloat(req.query.lat || 13.08);

    const activeCyclone = await Cyclone.findOne({ status: 'ACTIVE' });
    let cycloneDistanceKm = 999;
    if (activeCyclone) {
      cycloneDistanceKm = Math.round(calculateDistanceKm([lng, lat], activeCyclone.currentLocation.coordinates));
    }

    const nearestShelters = await findNearestShelters(lng, lat, 1);
    const nearestShelter = nearestShelters[0] || null;

    let riskLevel = 'LOW';
    let recommendation = 'Monitor standard weather updates.';

    if (cycloneDistanceKm < 60) {
      riskLevel = 'CRITICAL';
      recommendation = 'EVACUATE IMMEDIATELY. Seek nearest concrete shelter or elevated safe structure.';
    } else if (cycloneDistanceKm < 120) {
      riskLevel = 'HIGH';
      recommendation = 'Prepare emergency go-bag. Evacuation recommended for vulnerable citizens.';
    } else if (cycloneDistanceKm < 220) {
      riskLevel = 'MODERATE';
      recommendation = 'Avoid coastline. Secure loose structures and ensure backup water/power.';
    }

    res.json({
      success: true,
      userCoordinates: [lng, lat],
      riskLevel,
      cycloneDistanceKm,
      activeCycloneName: activeCyclone ? activeCyclone.name : 'None',
      nearestShelter: nearestShelter ? {
        name: nearestShelter.shelter.name,
        distanceKm: nearestShelter.distanceKm,
        availableCapacity: nearestShelter.shelter.available,
        status: nearestShelter.shelter.status,
        address: nearestShelter.shelter.address
      } : null,
      recommendation
    });
  } catch (err) { next(err); }
});

module.exports = router;
