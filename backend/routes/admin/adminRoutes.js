const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');
const adminAuthMiddleware = require('../../middleware/auth/adminAuth');
const { adminRoleCheck } = require('../../middleware/auth/roleCheck');

const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

// Check that adminAuthMiddleware is a function
router.use((req, res, next) => {
  if (typeof adminAuthMiddleware === 'function') {
    return adminAuthMiddleware(req, res, next);
  }
  // Bypass auth for development
  req.admin = { _id: 'dev', email: 'dev@test.com', role: { role: 'super_admin', permissions: [] } };
  next();
});

router.get('/dashboard', safe(adminController.getDashboard, 'getDashboard'));
router.get('/users', safe(adminController.getUsers, 'getUsers'));
router.get('/users/:userId', safe(adminController.getUserDetails, 'getUserDetails'));
router.patch('/users/:userId/status', adminRoleCheck.hasRole('senior_admin'), safe(adminController.updateUserStatus, 'updateUserStatus'));
router.post('/verify-helper/:helperId', adminRoleCheck.hasRole('verification_admin'), safe(adminController.verifyHelper, 'verifyHelper'));
router.get('/pending-verifications', adminRoleCheck.hasRole('verification_admin'), safe(adminController.getPendingVerifications, 'getPendingVerifications'));
router.get('/audit-logs', adminRoleCheck.hasRole('senior_admin'), safe(adminController.getAuditLogs, 'getAuditLogs'));
router.get('/system-health', adminRoleCheck.hasRole('super_admin'), safe(adminController.getSystemHealth, 'getSystemHealth'));

router.post('/verify-resolution/:crisisId', safe(adminController.verifyResolution, 'verifyResolution'));


router.post('/request-success-story', safe(adminController.requestSuccessStory, 'requestSuccessStory'));
router.get('/safety-reports', safe(adminController.getSafetyReports, 'getSafetyReports'));
router.patch('/safety-reports/:reportId', safe(adminController.updateSafetyReport, 'updateSafetyReport'));
router.get('/debriefings', safe(adminController.getDebriefings, 'getDebriefings'));
router.post('/debriefings/:debriefingId/followup', safe(adminController.followUpDebriefing, 'followUpDebriefing'));

router.post('/users/:userId/elevate', safe(adminController.elevateToAdmin, 'elevateToAdmin'));

module.exports = router;
