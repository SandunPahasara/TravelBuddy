const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'panadura-secret-key-2026';

/**
 * Helper to resolve admin to a real MongoDB user if possible
 */
async function resolveAdminUser(decoded) {
  try {
    if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) return user;
    }
    const adminByEmail = await User.findOne({ email: 'admin@travelbuddy.lk' }).select('-password');
    if (adminByEmail) return adminByEmail;

    const anyAdmin = await User.findOne({ role: 'admin' }).select('-password');
    if (anyAdmin) return anyAdmin;
  } catch (err) {
    console.warn('Could not resolve admin user from DB:', err.message);
  }

  return {
    _id: null,
    id: decoded.id || 'admin-1',
    name: decoded.username || 'Administrator',
    email: 'admin@travelbuddy.lk',
    role: 'admin'
  };
}

/**
 * Require authenticated user (or admin)
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // If token is from admin
    if (decoded.role === 'admin') {
      req.user = await resolveAdminUser(decoded);
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or has been removed.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please log in again.'
    });
  }
}

/**
 * Optional authentication: attaches req.user if a valid token exists,
 * but lets unauthenticated requests proceed as visitors.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin') {
      req.user = await resolveAdminUser(decoded);
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    req.user = user || null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

/**
 * Require administrator role
 */
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Administrator access required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin') {
      req.user = decoded;
      req.admin = decoded;
      return next();
    }

    const user = await User.findById(decoded.id);
    if (user && user.role === 'admin') {
      req.user = user;
      req.admin = user;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Administrator privileges required.'
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired administrator token.'
    });
  }
}

module.exports = {
  authenticateUser,
  optionalAuth,
  authenticateAdmin,
  JWT_SECRET
};
