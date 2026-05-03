const constants = require('../../config/constants');

const roleCheck = {
  isSeeker: (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== constants.USER_ROLES.SEEKER && req.user.role !== 'guest') {
      return res.status(403).json({ error: 'Access denied. Seeker role required.' });
    }
    next();
  },

  // Strict - requires verified status (for crisis acceptance, matching)
  isHelper: (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== constants.USER_ROLES.HELPER) {
      return res.status(403).json({ error: 'Access denied. Helper role required.' });
    }
    if (req.user.helperProfile && req.user.helperProfile.verificationStatus === 'suspended') {
      return res.status(403).json({ error: 'Helper account is suspended' });
    }
    next();
  },

  // Soft - allows pending/unverified helpers (for profile, stats, documents)
  isHelperOrPending: (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== constants.USER_ROLES.HELPER) {
      return res.status(403).json({ error: 'Access denied. Helper role required.' });
    }
    next();
  },

  isHelperOrSeeker: (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (![constants.USER_ROLES.SEEKER, constants.USER_ROLES.HELPER, 'guest'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  }
};

const adminRoleCheck = {
  hasRole: (requiredRole) => (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    if (req.admin.role?.role === 'super_admin') return next();
    if (req.admin.role?.role !== requiredRole) {
      return res.status(403).json({ error: `Access denied: ${requiredRole} required` });
    }
    next();
  },
  superAdmin: (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    if (req.admin.role?.role !== constants.ADMIN_ROLES.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
  },
  seniorAdmin: (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    const roles = [constants.ADMIN_ROLES.SUPER_ADMIN, constants.ADMIN_ROLES.SENIOR_ADMIN];
    if (!roles.includes(req.admin.role?.role)) {
      return res.status(403).json({ error: 'Senior admin access required' });
    }
    next();
  },
  verificationAdmin: (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    const roles = [constants.ADMIN_ROLES.SUPER_ADMIN, constants.ADMIN_ROLES.SENIOR_ADMIN, constants.ADMIN_ROLES.VERIFICATION_ADMIN];
    if (!roles.includes(req.admin.role?.role)) {
      return res.status(403).json({ error: 'Verification admin access required' });
    }
    next();
  },
  safetyAdmin: (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    const roles = [constants.ADMIN_ROLES.SUPER_ADMIN, constants.ADMIN_ROLES.SENIOR_ADMIN, constants.ADMIN_ROLES.SAFETY_ADMIN];
    if (!roles.includes(req.admin.role?.role)) {
      return res.status(403).json({ error: 'Safety admin access required' });
    }
    next();
  },
  contentAdmin: (req, res, next) => {
    if (!req.admin) return res.status(401).json({ error: 'Admin authentication required' });
    const roles = [constants.ADMIN_ROLES.SUPER_ADMIN, constants.ADMIN_ROLES.SENIOR_ADMIN, constants.ADMIN_ROLES.CONTENT_ADMIN];
    if (!roles.includes(req.admin.role?.role)) {
      return res.status(403).json({ error: 'Content admin access required' });
    }
    next();
  }
};

module.exports = { roleCheck, adminRoleCheck };
