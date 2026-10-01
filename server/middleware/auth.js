const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Cyclone_Emergency_Command_Super_Secret_Key_2026_Disaster_Ops');
    let user;
    try {
      user = await User.findById(decoded.id).select('-password').populate('agency');
    } catch (dbErr) {
      // If DB is offline, construct user from token
      user = {
        _id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        isActive: true
      };
    }

    if (!user) {
      user = {
        _id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        isActive: true
      };
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
};

module.exports = { protect };
