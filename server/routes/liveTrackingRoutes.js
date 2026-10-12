const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const ResponseTeam = require('../models/ResponseTeam');
const User = require('../models/User');
const { calculateDistanceKm } = require('../services/riskService');
const { emitEvent } = require('../sockets/socketManager');

/**
 * Helper to enrich an Incident document into a complete Live Tracking Session object
 */
const enrichIncidentTracking = (inc) => {
  const obj = inc.toObject ? inc.toObject() : { ...inc };

  const citizenCoords =
    obj.citizenLiveLocation?.coordinates?.length === 2
      ? obj.citizenLiveLocation.coordinates
      : obj.location?.coordinates?.length === 2
      ? obj.location.coordinates
      : [80.2707, 13.0827];

  const teamCoords =
    obj.teamLiveLocation?.coordinates?.length === 2
      ? obj.teamLiveLocation.coordinates
      : obj.assignedTeam?.currentLocation?.coordinates?.length === 2
      ? obj.assignedTeam.currentLocation.coordinates
      : [Number((citizenCoords[0] - 0.018).toFixed(5)), Number((citizenCoords[1] + 0.014).toFixed(5))];

  const volunteerCoords =
    obj.volunteerDetails?.coordinates?.length === 2
      ? obj.volunteerDetails.coordinates
      : [Number((citizenCoords[0] - 0.011).toFixed(5)), Number((citizenCoords[1] - 0.009).toFixed(5))];

  const teamDistKm = Number(calculateDistanceKm(citizenCoords, teamCoords).toFixed(2));
  const volDistKm = Number(calculateDistanceKm(citizenCoords, volunteerCoords).toFixed(2));

  // Assume Rescue Vehicle avg speed ~35 km/h in storm conditions, Volunteer ~22 km/h
  const teamEtaMinutes = Math.max(1, Math.round((teamDistKm / 35) * 60));
  const volunteerEtaMinutes = Math.max(1, Math.round((volDistKm / 22) * 60));

  const teamStatus =
    teamDistKm <= 0.08
      ? 'ON_SCENE'
      : obj.teamLiveLocation?.status || 'EN_ROUTE';

  const volunteerStatus =
    volDistKm <= 0.08
      ? 'ON_SCENE'
      : obj.volunteerDetails?.status || 'EN_ROUTE';

  return {
    _id: obj._id,
    incidentId: obj.incidentId,
    title: obj.title,
    emergencyType: obj.emergencyType,
    severity: obj.severity || 'CRITICAL',
    status: obj.status || 'ASSIGNED',
    address: obj.address || 'Coastal Emergency Sector',
    district: obj.district || 'Chennai',
    victimCount: obj.victimCount || 1,
    reporterName: obj.reporterName || 'Citizen in Distress',
    reporterPhone: obj.reporterPhone || '+91 98401 23456',
    description: obj.description || '',
    reportedAt: obj.reportedAt || obj.createdAt || new Date(),
    citizenLiveLocation: {
      coordinates: citizenCoords,
      accuracy: obj.citizenLiveLocation?.accuracy || 10,
      heading: obj.citizenLiveLocation?.heading || 0,
      speed: obj.citizenLiveLocation?.speed || 0,
      isSharingLive: obj.citizenLiveLocation?.isSharingLive !== false,
      updatedAt: obj.citizenLiveLocation?.updatedAt || new Date()
    },
    assignedTeam: {
      _id: obj.assignedTeam?._id || 'team_alpha',
      teamId: obj.assignedTeam?.teamId || 'TEAM-101',
      name: obj.assignedTeam?.name || 'NDRF Rapid Rescue Unit Alpha',
      type: obj.assignedTeam?.type || 'Search & Rescue',
      leaderName: obj.assignedTeam?.leaderName || 'Cmdr. Rajeshwari Iyer',
      contactPhone: obj.assignedTeam?.contactPhone || '+91 94441 00108',
      vehiclePlate: obj.assignedTeam?.vehicle?.plateNumber || 'TN-01-NDRF-402',
      vehicleType: obj.assignedTeam?.vehicle?.type || 'Amphibious Flood Rescue Truck',
      coordinates: teamCoords,
      status: teamStatus,
      distanceKm: teamDistKm,
      distanceMeters: Math.round(teamDistKm * 1000),
      etaMinutes: teamDistKm <= 0.08 ? 0 : teamEtaMinutes,
      updatedAt: obj.teamLiveLocation?.updatedAt || new Date()
    },
    assignedVolunteer: {
      userId: obj.assignedVolunteer || 'vol_01',
      name: obj.volunteerDetails?.name || 'Aravind Swaminathan',
      phone: obj.volunteerDetails?.phone || '+91 94440 12891',
      skills: obj.volunteerDetails?.skills || 'Flood Rescue, First Aid & Evacuation',
      coordinates: volunteerCoords,
      status: volunteerStatus,
      distanceKm: volDistKm,
      distanceMeters: Math.round(volDistKm * 1000),
      etaMinutes: volDistKm <= 0.08 ? 0 : volunteerEtaMinutes,
      updatedAt: obj.volunteerDetails?.updatedAt || new Date()
    }
  };
};

/**
 * GET /api/live-tracking/overview
 * Returns all active SOS tracking sessions, response teams, and field volunteers
 */
router.get('/overview', async (req, res, next) => {
  try {
    const incidents = await Incident.find({
      status: { $nin: ['RESOLVED', 'CLOSED'] }
    })
      .populate('assignedTeam')
      .sort({ createdAt: -1 })
      .limit(25);

    const activeSosSessions = incidents.map(enrichIncidentTracking);

    const teams = await ResponseTeam.find({}).populate('assignedIncident');
    const dbVolunteers = await User.find({ role: 'volunteer' }).select('name email phone skills location availability district');

    const defaultVolunteers = [
      {
        _id: 'vol_live_1',
        name: 'Aravind Swaminathan',
        phone: '+91 94440 12891',
        skills: ['Flood Rescue', 'First Aid'],
        district: 'Chennai',
        availability: 'on-duty',
        coordinates: [80.2625, 13.0745]
      },
      {
        _id: 'vol_live_2',
        name: 'Divya Parthasarathy',
        phone: '+91 98842 67123',
        skills: ['Paramedic Triage', 'Elderly Evacuation'],
        district: 'Chennai',
        availability: 'on-duty',
        coordinates: [80.2485, 13.0610]
      },
      {
        _id: 'vol_live_3',
        name: 'Karthik Subramanian',
        phone: '+91 97910 88234',
        skills: ['Ham Radio Comms', 'Boat Rescue'],
        district: 'Chengalpattu',
        availability: 'available',
        coordinates: [80.2780, 13.0990]
      }
    ];

    const volunteers =
      dbVolunteers.length > 0
        ? dbVolunteers.map((v, idx) => ({
            _id: v._id,
            name: v.name,
            phone: v.phone || '+91 94440 12891',
            skills: v.skills?.length ? v.skills : ['Flood Rescue', 'First Aid'],
            district: v.district || 'Chennai',
            availability: v.availability || 'on-duty',
            coordinates:
              v.location?.coordinates?.length === 2
                ? v.location.coordinates
                : defaultVolunteers[idx % defaultVolunteers.length].coordinates
          }))
        : defaultVolunteers;

    res.json({
      success: true,
      activeSosSessions,
      responseTeams: teams,
      volunteers
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/live-tracking/incident/:incidentId
 * Fetch live tracking telemetry for a specific SOS incident
 */
router.get('/incident/:incidentId', async (req, res, next) => {
  try {
    const { incidentId } = req.params;
    let inc = await Incident.findOne({ incidentId }).populate('assignedTeam');
    if (!inc && incidentId.match(/^[0-9a-fA-F]{24}$/)) {
      inc = await Incident.findById(incidentId).populate('assignedTeam');
    }
    if (!inc) {
      return res.status(404).json({ success: false, message: 'SOS Tracking Session not found' });
    }
    res.json({
      success: true,
      data: enrichIncidentTracking(inc)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/live-tracking/citizen-location
 * Updates Citizen's live GPS coordinates while SOS is active
 */
router.post('/citizen-location', async (req, res, next) => {
  try {
    const { incidentId, coordinates, accuracy, heading, speed, isSharingLive } = req.body;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Valid [lng, lat] coordinates are required' });
    }

    const [lng, lat] = [Number(coordinates[0]), Number(coordinates[1])];
    let inc = null;

    if (incidentId) {
      inc = await Incident.findOne({ incidentId }).populate('assignedTeam');
      if (!inc && String(incidentId).match(/^[0-9a-fA-F]{24}$/)) {
        inc = await Incident.findById(incidentId).populate('assignedTeam');
      }
    }
    if (!inc) {
      inc = await Incident.findOne({ status: { $nin: ['RESOLVED', 'CLOSED'] } })
        .sort({ createdAt: -1 })
        .populate('assignedTeam');
    }

    if (!inc) {
      return res.status(404).json({ success: false, message: 'No active SOS incident found to update' });
    }

    inc.location = { type: 'Point', coordinates: [lng, lat] };
    inc.citizenLiveLocation = {
      coordinates: [lng, lat],
      accuracy: Number(accuracy || 8),
      heading: Number(heading || 0),
      speed: Number(speed || 0),
      isSharingLive: isSharingLive !== false,
      updatedAt: new Date()
    };

    await inc.save();
    const enriched = enrichIncidentTracking(inc);
    emitEvent('tracking:location_update', enriched);

    res.json({
      success: true,
      message: 'Citizen live GPS location updated',
      data: enriched
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/live-tracking/unit-location
 * Updates live GPS location of a Response Team or Field Volunteer
 */
router.post('/unit-location', async (req, res, next) => {
  try {
    const { incidentId, unitType, coordinates, status, userId, teamId } = req.body;
    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({ success: false, message: 'Valid [lng, lat] coordinates are required' });
    }

    const [lng, lat] = [Number(coordinates[0]), Number(coordinates[1])];

    // Also update User or ResponseTeam collection if ID provided
    if (unitType === 'volunteer' && userId && String(userId).match(/^[0-9a-fA-F]{24}$/)) {
      await User.findByIdAndUpdate(userId, {
        location: { type: 'Point', coordinates: [lng, lat] }
      }).catch(() => {});
    }
    if (unitType === 'team' && teamId && String(teamId).match(/^[0-9a-fA-F]{24}$/)) {
      await ResponseTeam.findByIdAndUpdate(teamId, {
        'currentLocation.coordinates': [lng, lat]
      }).catch(() => {});
    }

    let inc = null;
    if (incidentId) {
      inc = await Incident.findOne({ incidentId }).populate('assignedTeam');
      if (!inc && String(incidentId).match(/^[0-9a-fA-F]{24}$/)) {
        inc = await Incident.findById(incidentId).populate('assignedTeam');
      }
    }
    if (!inc) {
      inc = await Incident.findOne({ status: { $nin: ['RESOLVED', 'CLOSED'] } })
        .sort({ createdAt: -1 })
        .populate('assignedTeam');
    }

    if (inc) {
      if (unitType === 'volunteer') {
        inc.volunteerDetails = {
          ...(inc.volunteerDetails ? inc.volunteerDetails.toObject?.() || inc.volunteerDetails : {}),
          coordinates: [lng, lat],
          status: status || 'EN_ROUTE',
          updatedAt: new Date()
        };
      } else {
        inc.teamLiveLocation = {
          ...(inc.teamLiveLocation ? inc.teamLiveLocation.toObject?.() || inc.teamLiveLocation : {}),
          coordinates: [lng, lat],
          status: status || 'EN_ROUTE',
          updatedAt: new Date()
        };
        if (inc.assignedTeam) {
          await ResponseTeam.findByIdAndUpdate(inc.assignedTeam._id, {
            'currentLocation.coordinates': [lng, lat]
          }).catch(() => {});
        }
      }
      await inc.save();
      const enriched = enrichIncidentTracking(inc);
      emitEvent('tracking:location_update', enriched);
      return res.json({
        success: true,
        message: `${unitType === 'volunteer' ? 'Volunteer' : 'Response Team'} live GPS updated`,
        data: enriched
      });
    }

    emitEvent('tracking:field_unit_ping', { unitType, coordinates: [lng, lat], userId, teamId, updatedAt: new Date() });
    res.json({ success: true, coordinates: [lng, lat] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/live-tracking/simulate-step/:incidentId
 * Moves the assigned Response Team & Volunteer closer to the Citizen's live SOS position
 * (or resets their starting positions if reset=true) for real-time live tracking demonstration
 */
router.post('/simulate-step/:incidentId', async (req, res, next) => {
  try {
    const { incidentId } = req.params;
    const { reset } = req.body || {};

    let inc = await Incident.findOne({ incidentId }).populate('assignedTeam');
    if (!inc && String(incidentId).match(/^[0-9a-fA-F]{24}$/)) {
      inc = await Incident.findById(incidentId).populate('assignedTeam');
    }
    if (!inc) {
      return res.status(404).json({ success: false, message: 'SOS Incident not found' });
    }

    const cCoords =
      inc.citizenLiveLocation?.coordinates?.length === 2
        ? inc.citizenLiveLocation.coordinates
        : inc.location?.coordinates?.length === 2
        ? inc.location.coordinates
        : [80.2707, 13.0827];

    if (reset) {
      const resetTeam = [Number((cCoords[0] - 0.018).toFixed(5)), Number((cCoords[1] + 0.014).toFixed(5))];
      const resetVol = [Number((cCoords[0] - 0.011).toFixed(5)), Number((cCoords[1] - 0.009).toFixed(5))];
      inc.teamLiveLocation = {
        coordinates: resetTeam,
        heading: 120,
        speed: 38,
        status: 'EN_ROUTE',
        updatedAt: new Date()
      };
      inc.volunteerDetails = {
        ...(inc.volunteerDetails ? inc.volunteerDetails.toObject?.() || inc.volunteerDetails : {}),
        coordinates: resetVol,
        status: 'EN_ROUTE',
        updatedAt: new Date()
      };
      await inc.save();
      const enriched = enrichIncidentTracking(inc);
      emitEvent('tracking:location_update', enriched);
      return res.json({ success: true, data: enriched });
    }

    const curTeam =
      inc.teamLiveLocation?.coordinates?.length === 2
        ? inc.teamLiveLocation.coordinates
        : [Number((cCoords[0] - 0.018).toFixed(5)), Number((cCoords[1] + 0.014).toFixed(5))];

    const curVol =
      inc.volunteerDetails?.coordinates?.length === 2
        ? inc.volunteerDetails.coordinates
        : [Number((cCoords[0] - 0.011).toFixed(5)), Number((cCoords[1] - 0.009).toFixed(5))];

    // Move 22% closer to citizen on each step
    const stepFraction = 0.22;
    const nextTeam = [
      Number((curTeam[0] + (cCoords[0] - curTeam[0]) * stepFraction).toFixed(5)),
      Number((curTeam[1] + (cCoords[1] - curTeam[1]) * stepFraction).toFixed(5))
    ];
    const nextVol = [
      Number((curVol[0] + (cCoords[0] - curVol[0]) * stepFraction).toFixed(5)),
      Number((curVol[1] + (cCoords[1] - curVol[1]) * stepFraction).toFixed(5))
    ];

    const newTeamDist = calculateDistanceKm(cCoords, nextTeam);
    const newVolDist = calculateDistanceKm(cCoords, nextVol);

    inc.teamLiveLocation = {
      coordinates: nextTeam,
      heading: 120,
      speed: newTeamDist <= 0.08 ? 0 : 38,
      status: newTeamDist <= 0.08 ? 'ON_SCENE' : 'EN_ROUTE',
      updatedAt: new Date()
    };

    inc.volunteerDetails = {
      ...(inc.volunteerDetails ? inc.volunteerDetails.toObject?.() || inc.volunteerDetails : {}),
      coordinates: nextVol,
      status: newVolDist <= 0.08 ? 'ON_SCENE' : 'EN_ROUTE',
      updatedAt: new Date()
    };

    if (inc.assignedTeam) {
      await ResponseTeam.findByIdAndUpdate(inc.assignedTeam._id, {
        'currentLocation.coordinates': nextTeam
      }).catch(() => {});
    }

    await inc.save();
    const enriched = enrichIncidentTracking(inc);
    emitEvent('tracking:location_update', enriched);

    res.json({
      success: true,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
