const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, phone, district, skills, coordinates, agency } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    // Validate permitted signup roles (security: admin/officer requires administrative elevation)
    const allowedRoles = ['citizen', 'volunteer', 'coordinator', 'responder'];
    const assignedRole = allowedRoles.includes(role?.toLowerCase()) ? role.toLowerCase() : 'citizen';
    const requiresApproval = ['coordinator', 'volunteer', 'responder'].includes(assignedRole);

    // Format skills array
    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills.filter(Boolean).map(s => String(s).trim());
    } else if (typeof skills === 'string' && skills.trim().length > 0) {
      skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      phone: phone ? phone.trim() : '',
      district: district ? district.trim() : 'Coastal Sector',
      skills: skillsArray,
      agency: agency || undefined,
      availability: 'available',
      isApproved: !requiresApproval,
      location: coordinates ? { type: 'Point', coordinates } : undefined
    });

    try {
      await AuditLog.create({
        user: user._id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_REGISTER',
        module: 'AUTH',
        details: { email: user.email, role: user.role, district: user.district, skills: user.skills, isApproved: user.isApproved }
      });
    } catch (e) {}

    // Real-time broadcast to Admin/Officer dashboard
    try {
      const { emitEvent } = require('../sockets/socketManager');
      emitEvent('admin:user_registered', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        district: user.district,
        skills: user.skills,
        availability: user.availability,
        isApproved: user.isApproved,
        createdAt: user.createdAt
      });
    } catch (sErr) {}

    if (requiresApproval) {
      return res.status(201).json({
        success: true,
        requiresApproval: true,
        message: `Account registration submitted! As an operational stakeholder (${assignedRole.toUpperCase()}), your profile is pending verification and approval by an EOC Administrator or Officer. You can log in once authorized.`
      });
    }

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        district: user.district,
        skills: user.skills,
        availability: user.availability
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    // Try MongoDB query first
    try {
      const user = await User.findOne({ email }).populate('agency');
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
          // Verify operational accounts approval status
          if (user.isApproved === false && ['coordinator', 'volunteer', 'responder'].includes(user.role)) {
            return res.status(403).json({
              success: false,
              message: `Your account registration as ${user.role.toUpperCase()} is pending verification and approval by an EOC Administrator or Officer. Please check back shortly.`
            });
          }

          const token = user.generateAuthToken();
          try {
            await AuditLog.create({
              user: user._id,
              userName: user.name,
              userRole: user.role,
              action: 'USER_LOGIN',
              module: 'AUTH',
              details: { ip: req.ip }
            });
          } catch(e) {}

          return res.json({
            success: true,
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone,
              agency: user.agency,
              location: user.location
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn('[Auth DB Query warning]: Falling back to pre-seeded demo user store:', dbErr.message);
    }

    // High-availability Demo User Store fallback (supports all 6 roles with 'password123')
    const demoAccounts = {
      'admin@cycloneops.gov': { id: '6a9fb635e3261447d0177ed6', name: 'Chief Commander Rajesh Varma', role: 'admin', phone: '+91 98400 11001', agency: { name: 'Tamil Nadu State Disaster Management Authority', code: 'TNSDMA' } },
      'officer@cycloneops.gov': { id: '6a9fb635e3261447d0177ed7', name: 'Senior Officer Ananya Iyer', role: 'officer', phone: '+91 98400 22002', agency: { name: 'Tamil Nadu State Disaster Management Authority', code: 'TNSDMA' } },
      'responder@cycloneops.gov': { id: '6a9fb635e3261447d0177ed8', name: 'Commander Vikram Rathore (NDRF)', role: 'responder', phone: '+91 98400 33003', agency: { name: 'National Disaster Response Force', code: 'NDRF' } },
      'coordinator@cycloneops.gov': { id: '6a9fb635e3261447d0177ed9', name: 'Logistics Head Meera Krishnan', role: 'coordinator', phone: '+91 98400 44004', agency: { name: 'Tamil Nadu State Disaster Management Authority', code: 'TNSDMA' } },
      'volunteer@cycloneops.gov': { id: '6a9fb635e3261447d0177eda', name: 'Karthik Subramanian (Volunteer)', role: 'volunteer', phone: '+91 98400 55005', agency: null },
      'citizen@cycloneops.gov': { id: '6a9fb635e3261447d0177edb', name: 'Suresh Kumar (Citizen)', role: 'citizen', phone: '+91 98400 66006', agency: null }
    };

    const targetAccount = demoAccounts[email?.toLowerCase()];
    if (targetAccount && password === 'password123') {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: targetAccount.id, name: targetAccount.name, email, role: targetAccount.role },
        process.env.JWT_SECRET || 'Cyclone_Emergency_Command_Super_Secret_Key_2026_Disaster_Ops',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: targetAccount.id,
          name: targetAccount.name,
          email,
          role: targetAccount.role,
          phone: targetAccount.phone,
          agency: targetAccount.agency,
          location: { type: 'Point', coordinates: [80.2707, 13.0827] }
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials. Use demo accounts or check password.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
