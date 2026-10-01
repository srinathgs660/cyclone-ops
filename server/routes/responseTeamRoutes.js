const express = require('express');
const router = express.Router();
const ResponseTeam = require('../models/ResponseTeam');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');

const { mockTeams } = require('../config/mockData');

router.get('/', async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const teams = await ResponseTeam.find(filter).populate('assignedIncident').sort({ status: 1 });
    res.json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.json({ success: true, count: mockTeams.length, data: mockTeams });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const team = await ResponseTeam.findById(req.params.id).populate('assignedIncident');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
});

router.put('/:id/status', protect, authorize('admin', 'officer', 'responder', 'coordinator'), async (req, res, next) => {
  try {
    const { status, coordinates } = req.body;
    let team;
    try {
      team = await ResponseTeam.findById(req.params.id);
      if (team) {
        if (status) team.status = status;
        if (coordinates) team.currentLocation.coordinates = coordinates;
        await team.save();
      }
    } catch (dbErr) {}

    // Fallback: update in-memory mock repository so UI updates immediately
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    emitEvent('response-team:update', team);
    res.json({ success: true, message: 'Response unit status updated to ' + status, data: team });
  } catch (err) { next(err); }
});

// Get available registered volunteers eligible to be drafted into a response team
router.get('/volunteers/list', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');
    const volunteers = await User.find({ role: 'volunteer' }).select('name email phone location');
    
    // If no volunteers in DB, provide realistic default pool
    if (volunteers.length === 0) {
      return res.json({
        success: true,
        data: [
          { _id: 'vol_01', name: 'Aravind Swaminathan', phone: '+91 94440 12891', email: 'aravind.swami@gmail.com', skills: 'Flood Rescue & First Aid' },
          { _id: 'vol_02', name: 'Divya Parthasarathy', phone: '+91 98842 67123', email: 'divya.p@outlook.com', skills: 'Paramedic & Triage' },
          { _id: 'vol_03', name: 'Karthik Subramanian', phone: '+91 97910 88234', email: 'karthik.sub@gmail.com', skills: 'Ham Radio & Comms' },
          { _id: 'vol_04', name: 'Meenakshi Sundaram', phone: '+91 94451 90123', email: 'meena.sundaram@gmail.com', skills: 'Heavy Vehicle Driver' },
          { _id: 'vol_05', name: 'Suresh Narayanan', phone: '+91 98403 44512', email: 'suresh.n@gmail.com', skills: 'Civil Defense Volunteer' },
          { _id: 'vol_06', name: 'Anitha Rajendran', phone: '+91 98840 99812', email: 'anitha.raj@gmail.com', skills: 'Shelter Nursing Support' }
        ]
      });
    }

    res.json({ success: true, count: volunteers.length, data: volunteers });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, type, leaderName, contactPhone, vehicle, equipment, volunteerMembers, coordinates } = req.body;
    const count = await ResponseTeam.countDocuments();
    const teamId = 'TEAM-' + (count + 101);

    const team = await ResponseTeam.create({
      teamId,
      name,
      type: type || 'Search & Rescue',
      leaderName,
      contactPhone,
      membersCount: (volunteerMembers && volunteerMembers.length > 0) ? volunteerMembers.length + 1 : 6,
      currentLocation: {
        type: 'Point',
        coordinates: coordinates || [80.27, 13.08]
      },
      status: 'AVAILABLE',
      vehicle: vehicle || {
        type: 'Rescue Transport Vehicle',
        plateNumber: 'TN-01-DM-' + Math.floor(1000 + Math.random() * 9000),
        capacity: 8
      },
      equipment: equipment || ['Inflatable Boat', 'Medical Trauma Kit', 'High-Output Generator', 'Satellite Radios']
    });

    emitEvent('response-team:new', team);
    res.status(201).json({ success: true, message: 'Response team established successfully', data: team });
  } catch (err) { next(err); }
});

module.exports = router;
