const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Agency = require('../models/Agency');
const AuditLog = require('../models/AuditLog');
const ResponseTeam = require('../models/ResponseTeam');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');

// Restrict all routes below to authenticated Admins
router.use(protect, authorize('admin'));

/**
 * GET /api/admin/users
 * Retrieve users with role filtering, search, and populated team/agency data
 */
router.get('/users', async (req, res, next) => {
  try {
    const { role, search, district, availability } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role.toLowerCase();
    }

    if (district && district !== 'all') {
      query.district = new RegExp(district, 'i');
    }

    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('agency')
      .populate('assignedTeam')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id
 * General user profile / status update
 */
router.put('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select('-password')
      .populate('agency')
      .populate('assignedTeam');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_UPDATE',
      module: 'ADMIN',
      details: { targetUserId: user._id, updatedFields: Object.keys(req.body) }
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user account
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Remove user from any response team members
    await ResponseTeam.updateMany(
      { members: user._id },
      { $pull: { members: user._id, memberDetails: { userId: user._id } } }
    );

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'USER_DELETE',
      module: 'ADMIN',
      details: { deletedEmail: user.email, deletedName: user.name, role: user.role }
    });

    res.json({ success: true, message: 'User successfully removed' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/create-team
 * Assemble a new ResponseTeam from selected volunteers / responders
 */
router.post('/create-team', async (req, res, next) => {
  try {
    const { name, type, leaderName, contactPhone, vehicleType, memberIds, district, equipment } = req.body;

    if (!name || !leaderName || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Team name, leader name, and contact phone are required.' });
    }

    const teamCount = await ResponseTeam.countDocuments();
    const teamId = `RT-${(teamCount + 1).toString().padStart(3, '0')}`;

    // Get selected users info
    const membersList = Array.isArray(memberIds) && memberIds.length > 0
      ? await User.find({ _id: { $in: memberIds } })
      : [];

    const memberDetails = membersList.map(u => ({
      userId: u._id,
      name: u.name,
      role: u.role,
      phone: u.phone,
      skills: u.skills
    }));

    // Find agency or default to TNSDMA
    const agency = await Agency.findOne({ code: 'TNSDMA' }) || await Agency.findOne();

    // Default coordinates in coastal sector
    const defaultCoords = [80.2707, 13.0827];

    const newTeam = await ResponseTeam.create({
      teamId,
      name,
      type: type || 'Search & Rescue',
      agency: agency ? agency._id : undefined,
      membersCount: memberDetails.length + 1,
      leaderName,
      contactPhone,
      currentLocation: {
        type: 'Point',
        coordinates: defaultCoords
      },
      status: 'AVAILABLE',
      vehicle: {
        type: vehicleType || 'Multi-Utility Rescue Truck',
        plateNumber: `TN-${Math.floor(10 + Math.random() * 89)}-DM-${Math.floor(1000 + Math.random() * 9000)}`,
        capacity: Math.max(6, memberDetails.length + 2)
      },
      equipment: equipment && equipment.length > 0 ? equipment : ['First-Aid Trauma Kits', 'Inflatable Life Jackets', 'Satellite Radios', 'Tree Clearing Saws'],
      members: membersList.map(m => m._id),
      memberDetails
    });

    // Update all assigned users with team reference and status
    if (membersList.length > 0) {
      await User.updateMany(
        { _id: { $in: membersList.map(m => m._id) } },
        {
          $set: {
            assignedTeam: newTeam._id,
            availability: 'assigned',
            'assignedTask.title': `Assigned to ${newTeam.name}`,
            'assignedTask.category': newTeam.type,
            'assignedTask.status': 'In-Progress',
            'assignedTask.location': district || 'Coastal District'
          }
        }
      );
    }

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TEAM_CREATE',
      module: 'ADMIN',
      details: { teamId: newTeam.teamId, name: newTeam.name, membersCount: memberDetails.length }
    });

    // Broadcast team creation via WebSockets
    try {
      emitEvent('team:created', newTeam);
      emitEvent('teams:refresh', { teamId: newTeam.teamId });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: `Response Team "${newTeam.name}" successfully created with ${memberDetails.length} members.`,
      data: newTeam
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/assign-team
 * Assign specific user(s) to an existing response team
 */
router.put('/assign-team', async (req, res, next) => {
  try {
    const { userIds, teamId } = req.body;

    if (!teamId || !userIds || (Array.isArray(userIds) && userIds.length === 0)) {
      return res.status(400).json({ success: false, message: 'Please provide teamId and at least one userId.' });
    }

    const ids = Array.isArray(userIds) ? userIds : [userIds];
    const team = await ResponseTeam.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: 'Response team not found.' });

    const users = await User.find({ _id: { $in: ids } });

    // Update team members
    for (const u of users) {
      if (!team.members.includes(u._id)) {
        team.members.push(u._id);
        team.memberDetails.push({
          userId: u._id,
          name: u.name,
          role: u.role,
          phone: u.phone,
          skills: u.skills
        });
      }
    }
    team.membersCount = team.members.length;
    await team.save();

    // Update users
    await User.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          assignedTeam: team._id,
          availability: 'assigned',
          'assignedTask.title': `Assigned to ${team.name}`,
          'assignedTask.category': team.type,
          'assignedTask.status': 'In-Progress'
        }
      }
    );

    try {
      emitEvent('teams:refresh', { teamId: team._id });
    } catch (e) {}

    res.json({
      success: true,
      message: `${users.length} personnel assigned to team ${team.name}.`,
      data: team
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/assign-task
 * Assign an operational task to any user (volunteer, responder, coordinator, or citizen)
 */
router.put('/assign-task', async (req, res, next) => {
  try {
    const { userId, title, description, category, priority, location } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ success: false, message: 'User ID and Task Title are required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const taskId = `TSK-${Date.now().toString().slice(-5)}`;
    user.assignedTask = {
      taskId,
      title: title.trim(),
      description: description ? description.trim() : 'Operational assignment directed by EOC Command.',
      category: category || 'General Assistance',
      priority: priority || 'Medium',
      location: location ? location.trim() : user.district || 'Assigned Sector',
      status: 'In-Progress',
      assignedAt: new Date(),
      assignedBy: req.user.name || 'EOC Administrator'
    };
    user.availability = 'on-duty';

    await user.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TASK_ASSIGN',
      module: 'ADMIN',
      details: { taskId, targetUser: user.name, targetEmail: user.email, title: user.assignedTask.title }
    });

    try {
      emitEvent('user:task_assigned', {
        userId: user._id,
        task: user.assignedTask
      });
    } catch (e) {}

    res.json({
      success: true,
      message: `Task "${title}" successfully assigned to ${user.name}.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/update-task-status
 * Update user's task status (Pending, In-Progress, Completed)
 */
router.put('/update-task-status', async (req, res, next) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!user.assignedTask) {
      return res.status(400).json({ success: false, message: 'User has no active task.' });
    }

    user.assignedTask.status = status;
    if (status === 'Completed') {
      user.availability = 'available';
    } else {
      user.availability = 'on-duty';
    }

    await user.save();
    res.json({ success: true, message: `Task status updated to ${status}.`, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/assign-logistics
 * Coordinate and assign emergency supplies & warehouse transit to Logistics Coordinators / Volunteers
 */
router.put('/assign-logistics', async (req, res, next) => {
  try {
    const { userId, warehouse, destinationShelter, supplies, instructions } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.assignedLogistics = {
      warehouse: warehouse || 'Central Staging Warehouse - Chennai',
      destinationShelter: destinationShelter || 'Designated Coastal Cyclone Shelter',
      supplies: Array.isArray(supplies) && supplies.length > 0 ? supplies : [
        { item: 'Drinking Water (1L Pouches)', quantity: 2000, unit: 'packets' },
        { item: 'Ready-to-Eat Emergency Meals (MRE)', quantity: 1500, unit: 'rations' },
        { item: 'Emergency Medical Trauma Kits', quantity: 50, unit: 'kits' }
      ],
      instructions: instructions || 'Execute high-priority supply convoy dispatch to designated shelter.',
      status: 'Allocated',
      assignedAt: new Date()
    };
    user.availability = 'on-duty';

    await user.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'LOGISTICS_ASSIGN',
      module: 'ADMIN',
      details: { targetUser: user.name, warehouse, destinationShelter }
    });

    try {
      emitEvent('logistics:assigned', {
        userId: user._id,
        logistics: user.assignedLogistics
      });
    } catch (e) {}

    res.json({
      success: true,
      message: `Logistics supply dispatch coordinated with ${user.name}.`,
      data: user
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/teams
 * Retrieve all response teams with full member list
 */
router.get('/teams', async (req, res, next) => {
  try {
    const teams = await ResponseTeam.find({})
      .populate('agency')
      .populate('members', 'name email role phone skills availability');
    res.json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/audit-logs
 * Query immutable audit trails
 */
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/agencies
 * Query all registered agencies
 */
router.get('/agencies', async (req, res, next) => {
  try {
    const agencies = await Agency.find({});
    res.json({ success: true, count: agencies.length, data: agencies });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
