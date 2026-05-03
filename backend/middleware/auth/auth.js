const jwt = require('jsonwebtoken');
const User = require('../../models/core/User');
const GuestSession = require('../../models/core/GuestSession');
const logger = require('../../config/logger');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for Bearer token
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({ error: 'Token missing or malformed' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // =====================================================================
    // GUEST USER HANDLING (Try-Before-Register)
    // =====================================================================
    if (decoded.isGuest || decoded.role === 'guest') {
      const sessionId = decoded.sessionId || decoded.id;
      
      // Find valid guest session in database
      const guestSession = await GuestSession.findOne({ 
        sessionId,
        expiresAt: { $gt: new Date() },
        migratedTo: null
      });
      
      if (!guestSession) {
        return res.status(401).json({ 
          error: 'Guest session expired',
          requiresRegistration: true 
        });
      }
      
      // Restrict guest access to allowed endpoints only
      const allowedGuestPaths = [
        '/api/crisis/submit',
        '/api/crisis/panic',
        '/api/crisis/history/mine',
        '/api/auth/guest-session/status',
        '/api/auth/me',
        '/api/public/stats',
        '/api/public/success-stories'
      ];
      
      const isAllowedPath = allowedGuestPaths.some(path => 
        req.path.startsWith(path) || req.path.includes(path)
      );
      
      if (!isAllowedPath) {
        return res.status(403).json({ 
          error: 'Guest access limited. Please register for full access.',
          requiresRegistration: true,
          restrictedPath: req.path
        });
      }
      
      // Check if guest can still submit crises (for crisis endpoints)
      if (req.path.includes('/crisis/submit') && !guestSession.canSubmitCrisis()) {
        return res.status(403).json({
          error: 'Guest crisis limit reached. Please register to continue.',
          requiresRegistration: true,
          remainingCrises: 0
        });
      }
      
      // Attach guest user to request
      req.user = {
        id: sessionId,
        sessionId,
        name: decoded.name || guestSession.name,
        role: 'guest',
        isGuest: true
      };
      req.userId = sessionId;
      req.isGuest = true;
      req.guestSession = guestSession;
      
      logger.info('Guest authenticated', { 
        sessionId, 
        path: req.path,
        remainingCrises: guestSession.getRemainingCrises()
      });
      
      return next();
    }
    
    // =====================================================================
    // REGULAR USER AUTHENTICATION
    // =====================================================================
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'User not found in system' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked',
        lockedUntil: user.lockedUntil 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    req.isGuest = false;
    
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Session expired. Please login again',
        requiresRegistration: true
      });
    }
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Token not yet active' });
    }
    
    logger.error('Auth middleware error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path: req.path
    });
    
    res.status(500).json({ error: 'Authentication processing failed' });
  }
};

/**
 * Optional: Strict auth for routes that require registered users only
 * Rejects guest sessions
 */
const requireRegisteredUser = async (req, res, next) => {
  if (req.isGuest || req.user?.isGuest || req.user?.role === 'guest') {
    return res.status(403).json({
      error: 'This feature requires a registered account',
      requiresRegistration: true
    });
  }
  next();
};

/**
 * Optional: Role-based access control
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.isGuest && roles.includes('guest')) {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }
    
    next();
  };
};

module.exports = { protect, requireRegisteredUser, requireRole };