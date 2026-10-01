const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const ResponseTeam = require('../models/ResponseTeam');
const { calculateIncidentPriority, findBestResponseTeam } = require('../services/incidentService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');

const { mockIncidents } = require('../config/mockData');

router.get('/', async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    const incidents = await Incident.find(filter)
      .populate('assignedTeam')
      .populate('reportedBy', 'name phone')
      .sort({ priorityScore: -1, reportedAt: -1 });
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (err) {
    res.json({ success: true, count: mockIncidents.length, data: mockIncidents });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('assignedTeam');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, data: incident });
  } catch (err) { next(err); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { title, emergencyType, coordinates, address, district, victimCount, description } = req.body;
    const incCount = await Incident.countDocuments();
    const incidentId = 'INC-' + (incCount + 101);

    const { priorityScore, severity } = calculateIncidentPriority(emergencyType, victimCount);

    const autoTeam = await findBestResponseTeam(coordinates, emergencyType);

    const incident = await Incident.create({
      incidentId,
      title,
      emergencyType,
      location: { type: 'Point', coordinates },
      address,
      district: district || 'Chennai',
      victimCount: victimCount || 1,
      description,
      priorityScore,
      severity,
      status: autoTeam ? 'ASSIGNED' : 'REPORTED',
      reportedBy: req.user._id,
      reporterName: req.user.name,
      reporterPhone: req.user.phone || '',
      assignedTeam: autoTeam ? autoTeam._id : null,
      assignedAt: autoTeam ? new Date() : null
    });

    if (autoTeam) {
      autoTeam.status = 'DISPATCHED';
      autoTeam.assignedIncident = incident._id;
      await autoTeam.save();
      emitEvent('response-team:update', autoTeam);
    }

    emitEvent('incident:new', incident);
    res.status(201).json({ success: true, data: incident });
  } catch (err) { next(err); }
});

router.put('/:id', protect, authorize('admin', 'officer', 'responder'), async (req, res, next) => {
  try {
    let incident;
    try {
      incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignedTeam');
    } catch (dbErr) {}

    // Fallback: update in mock array
    const mockInc = mockIncidents.find(i => String(i._id) === String(req.params.id));
    if (mockInc) {
      Object.assign(mockInc, req.body);
      incident = mockInc;
    }

    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    emitEvent('incident:updated', incident);
    res.json({ success: true, data: incident });
  } catch (err) { next(err); }
});

router.post('/:id/assign', protect, authorize('admin', 'officer'), async (req, res, next) => {
  try {
    const { teamId } = req.body;
    const incident = await Incident.findById(req.params.id);
    const team = await ResponseTeam.findById(teamId);
    if (!incident || !team) return res.status(404).json({ success: false, message: 'Incident or team not found' });

    incident.assignedTeam = team._id;
    incident.status = 'ASSIGNED';
    incident.assignedAt = new Date();
    await incident.save();

    team.status = 'DISPATCHED';
    team.assignedIncident = incident._id;
    await team.save();

    emitEvent('incident:updated', incident);
    emitEvent('response-team:update', team);

    res.json({ success: true, data: incident });
  } catch (err) { next(err); }
});

module.exports = router;
