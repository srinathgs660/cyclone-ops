const express = require('express');
const router = express.Router();
const AssistanceRequest = require('../models/AssistanceRequest');
const Incident = require('../models/Incident');
const Cyclone = require('../models/Cyclone');
const Shelter = require('../models/Shelter');
const { calculateDistanceKm } = require('../services/riskService');
const { findBestResponseTeam, findBestVolunteer } = require('../services/incidentService');
const { findNearestShelters } = require('../services/shelterService');
const { emitEvent } = require('../sockets/socketManager');

// POST /api/citizen/sos
router.post('/sos', async (req, res, next) => {
  try {
    const {
      fullName,
      contactPhone,
      emergencyType,
      coordinates,
      address,
      peopleCount,
      description,
      accuracy,
      isSharingLive
    } = req.body;
    if (!coordinates || !coordinates.length) {
      return res.status(400).json({ success: false, message: 'Coordinates are required for emergency dispatch' });
    }

    const incCount = await Incident.countDocuments();
    const incidentId = 'SOS-' + (incCount + 101 + Math.floor(Math.random() * 90));

    const autoTeam = await findBestResponseTeam(coordinates, emergencyType || 'Trapped');
    const autoVolunteer = await findBestVolunteer(coordinates);

    const [cLng, cLat] = [Number(coordinates[0]), Number(coordinates[1])];
    const teamStartCoords = autoTeam?.currentLocation?.coordinates?.length === 2
      ? autoTeam.currentLocation.coordinates
      : [Number((cLng - 0.018).toFixed(5)), Number((cLat + 0.014).toFixed(5))];

    const incident = await Incident.create({
      incidentId,
      title: 'CITIZEN SOS: ' + (fullName || 'Emergency Request') + ' (' + (emergencyType || 'General') + ')',
      emergencyType: emergencyType || 'Trapped Civilians',
      location: { type: 'Point', coordinates: [cLng, cLat] },
      address: address || 'Reported via Citizen Emergency App',
      victimCount: Number(peopleCount || 1),
      description: description || 'Citizen pressed emergency SOS with live GPS beacon',
      priorityScore: 95,
      severity: 'CRITICAL',
      status: 'ASSIGNED',
      reporterName: fullName || 'Citizen',
      reporterPhone: contactPhone || '',
      assignedTeam: autoTeam ? autoTeam._id : null,
      assignedVolunteer: autoVolunteer?.userId || null,
      volunteerDetails: {
        name: autoVolunteer.name,
        phone: autoVolunteer.phone,
        skills: autoVolunteer.skills,
        status: 'EN_ROUTE',
        coordinates: autoVolunteer.coordinates,
        updatedAt: new Date()
      },
      citizenLiveLocation: {
        coordinates: [cLng, cLat],
        accuracy: Number(accuracy || 10),
        heading: 0,
        speed: 0,
        isSharingLive: isSharingLive !== false,
        updatedAt: new Date()
      },
      teamLiveLocation: {
        coordinates: teamStartCoords,
        heading: 120,
        speed: 38,
        status: 'EN_ROUTE',
        updatedAt: new Date()
      },
      assignedAt: new Date()
    });

    const request = await AssistanceRequest.create({
      fullName: fullName || 'Citizen',
      contactPhone: contactPhone || '1070',
      emergencyType: emergencyType || 'Trapped',
      location: { type: 'Point', coordinates: [cLng, cLat] },
      address: address || '',
      peopleCount: Number(peopleCount || 1),
      description: description || '',
      priority: 'CRITICAL',
      status: 'TEAM_DISPATCHED',
      assignedIncident: incident._id
    });

    if (autoTeam) {
      autoTeam.status = 'DISPATCHED';
      autoTeam.assignedIncident = incident._id;
      await autoTeam.save();
      emitEvent('response-team:update', autoTeam);
    }

    emitEvent('incident:new', incident);
    emitEvent('tracking:sos_started', {
      incidentId: incident.incidentId,
      _id: incident._id,
      reporterName: incident.reporterName,
      reporterPhone: incident.reporterPhone,
      emergencyType: incident.emergencyType,
      victimCount: incident.victimCount,
      address: incident.address,
      citizenLiveLocation: incident.citizenLiveLocation,
      teamLiveLocation: incident.teamLiveLocation,
      volunteerDetails: incident.volunteerDetails,
      assignedTeamName: autoTeam ? autoTeam.name : 'NDRF Rapid Rescue Unit Alpha',
      assignedTeamPhone: autoTeam ? autoTeam.contactPhone : '+91 94441 00108',
      assignedTeamVehicle: autoTeam?.vehicle?.plateNumber || 'TN-01-NDRF-402'
    });
    emitEvent('sos:broadcast', {
      id: request._id,
      incidentId: incident.incidentId,
      fullName: request.fullName,
      victimCount: request.peopleCount,
      coordinates: [cLng, cLat],
      emergencyType: request.emergencyType
    });

    res.status(201).json({
      success: true,
      message: 'SOS Signal & Live GPS Stream activated! Rescue team and field volunteer are en route.',
      incidentId: incident.incidentId,
      incidentMongoId: incident._id,
      assignedTeam: autoTeam ? autoTeam.name : 'NDRF Rapid Rescue Unit Alpha',
      assignedTeamPhone: autoTeam ? autoTeam.contactPhone : '+91 94441 00108',
      assignedTeamVehicle: autoTeam?.vehicle?.plateNumber || 'TN-01-NDRF-402',
      assignedVolunteer: autoVolunteer.name,
      assignedVolunteerPhone: autoVolunteer.phone,
      citizenCoordinates: [cLng, cLat],
      teamCoordinates: teamStartCoords,
      volunteerCoordinates: autoVolunteer.coordinates
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
