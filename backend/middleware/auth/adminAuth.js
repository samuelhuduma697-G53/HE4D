/**
 * Admin Authentication Middleware
 * JWT verification for admin users
 */

const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin/Admin');
const AdminSession = require('../../models/admin/AdminSession');
const logger = require('../../config/logger');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is active
    const session = await AdminSession.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Find admin
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: 'Admin account is deactivated' });
    }

    if (admin.isAccountLocked && admin.isAccountLocked()) {
      return res.status(423).json({ error: 'Admin account is locked' });
    }

    // Update session activity
    if (session.updateActivity) {
      await session.updateActivity();
    }

    // Attach admin and session to request
    req.admin = admin;
    req.adminId = admin._id;
    req.session = session;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    logger.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = adminAuthMiddleware;
