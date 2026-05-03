const express = require('express');
const router = express.Router();
const AdminSession = require('../../models/admin/AdminSession');
const adminAuthMiddleware = require('../../middleware/auth/adminAuth');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

router.use(adminAuthMiddleware);

router.get('/active', asyncHandler(async (req, res) => {
  const sessions = await AdminSession.find({
    adminId: req.admin._id,
    isActive: true
  }).select('ipAddress userAgent lastActivityAt createdAt');
  
  res.json({ sessions });
}));

router.delete('/:sessionId', asyncHandler(async (req, res) => {
  await AdminSession.findOneAndUpdate(
    { _id: req.params.sessionId, adminId: req.admin._id },
    { isActive: false, terminatedAt: new Date(), terminatedBy: 'user' }
  );
  
  res.json({ message: 'Session terminated' });
}));

module.exports = router;
