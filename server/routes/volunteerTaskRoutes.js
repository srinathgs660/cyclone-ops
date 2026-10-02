const express = require('express');
const router = express.Router();
const VolunteerTask = require('../models/VolunteerTask');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { emitEvent } = require('../sockets/socketManager');

// Initial seed micro-tasks if collection is empty
const INITIAL_TASKS = [
  {
    title: 'Dry Food & Milk Packet Packaging',
    description: 'Pack 2,500 emergency dry rations (biscuits, baby milk powder, ORS packets, candles) for coastal fishing hamlet convoys.',
    category: 'Ration Distribution',
    priority: 'HIGH',
    location: 'Central Staging Warehouse #2, George Town, Chennai',
    district: 'Chennai',
    volunteersNeeded: 8,
    status: 'OPEN'
  },
  {
    title: 'Fallen Banyan Tree Removal - Arterial Cutoff',
    description: 'Chainsaw & tree-clearing crew needed to clear fallen branches obstructing ambulance & fire rescue access.',
    category: 'Tree & Road Clearing',
    priority: 'CRITICAL',
    location: 'Poonamallee High Road, near Kilpauk Medical College',
    district: 'Chennai',
    volunteersNeeded: 6,
    status: 'OPEN'
  },
  {
    title: 'Geriatric Evacuation & Wheelchair Assistance',
    description: 'Assist elderly bedridden citizens with safe wheelchair transport into designated high-ground shelter dormitories.',
    category: 'Elderly Assistance',
    priority: 'CRITICAL',
    location: 'Kotturpuram Lowland Colony, Adyar River Bank',
    district: 'Chennai',
    volunteersNeeded: 5,
    status: 'OPEN'
  },
  {
    title: 'Emergency Sandbag Embankment Reinforcement',
    description: 'Stack 500 pre-filled sandbags along vulnerable canal breach point to prevent flood water intrusion into residential wards.',
    category: 'Sandbagging & Flood Defense',
    priority: 'HIGH',
    location: 'Buckingham Canal Embankment, Ennore Creek',
    district: 'Tiruvallur',
    volunteersNeeded: 10,
    status: 'OPEN'
  }
];

/**
 * GET /api/volunteer-tasks
 * Returns active volunteer micro-tasks
 */
router.get('/', async (req, res, next) => {
  try {
    let count = await VolunteerTask.countDocuments();
    if (count === 0) {
      await VolunteerTask.insertMany(INITIAL_TASKS);
    }

    const { status, category, district } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (district && district !== 'all') filter.district = district;

    const tasks = await VolunteerTask.find(filter)
      .populate('createdBy', 'name role')
      .populate('volunteersAssigned.userId', 'name phone skills')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/volunteer-tasks
 * Officers & Admins broadcast a new micro-task
 */
router.post('/', protect, authorize('admin', 'officer', 'coordinator'), async (req, res, next) => {
  try {
    const { title, description, category, priority, location, district, volunteersNeeded } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ success: false, message: 'Title, description, and location are required' });
    }

    const task = await VolunteerTask.create({
      title,
      description,
      category: category || 'Shelter Logistics',
      priority: priority || 'HIGH',
      location,
      district: district || 'Chennai',
      volunteersNeeded: volunteersNeeded || 4,
      createdBy: req.user._id,
      status: 'OPEN'
    });

    try {
      emitEvent('volunteer:new_task', {
        id: task._id,
        title: task.title,
        category: task.category,
        priority: task.priority,
        location: task.location,
        volunteersNeeded: task.volunteersNeeded
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: `Micro-task '${title}' broadcasted to field volunteer squads.`,
      data: task
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/volunteer-tasks/:id/accept
 * Volunteer accepts a micro-task assignment
 */
router.post('/:id/accept', protect, async (req, res, next) => {
  try {
    const task = await VolunteerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const alreadyAccepted = task.volunteersAssigned.some(v => v.userId?.toString() === req.user._id.toString());
    if (alreadyAccepted) {
      return res.status(400).json({ success: false, message: 'You have already accepted this assignment' });
    }

    task.volunteersAssigned.push({
      userId: req.user._id,
      name: req.user.name,
      phone: req.user.phone || 'Field Radio Check-in',
      status: 'ACCEPTED',
      acceptedAt: new Date()
    });

    if (task.volunteersAssigned.length >= task.volunteersNeeded) {
      task.status = 'IN_PROGRESS';
    }

    await task.save();

    try {
      emitEvent('volunteer:task_accepted', {
        taskId: task._id,
        volunteerName: req.user.name,
        assignedCount: task.volunteersAssigned.length,
        needed: task.volunteersNeeded
      });
    } catch (e) {}

    res.json({
      success: true,
      message: `Assignment confirmed for '${task.title}'. Thank you for your service!`,
      data: task
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/volunteer-tasks/:id/complete
 * Volunteer marks task completed with field verification notes
 */
router.post('/:id/complete', protect, async (req, res, next) => {
  try {
    const { proofNotes } = req.body;
    const task = await VolunteerTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const volunteerEntry = task.volunteersAssigned.find(v => v.userId?.toString() === req.user._id.toString());
    if (volunteerEntry) {
      volunteerEntry.status = 'COMPLETED';
      volunteerEntry.completedAt = new Date();
      volunteerEntry.proofNotes = proofNotes || 'Task completed successfully according to operational protocol.';
    }

    // If all assigned have completed, close task
    const allDone = task.volunteersAssigned.length > 0 && task.volunteersAssigned.every(v => v.status === 'COMPLETED');
    if (allDone) {
      task.status = 'COMPLETED';
    }

    await task.save();

    try {
      emitEvent('volunteer:task_completed', {
        taskId: task._id,
        volunteerName: req.user.name,
        taskTitle: task.title,
        status: task.status
      });
    } catch (e) {}

    res.json({
      success: true,
      message: `Task '${task.title}' marked as completed. Operation verified!`,
      data: task
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
