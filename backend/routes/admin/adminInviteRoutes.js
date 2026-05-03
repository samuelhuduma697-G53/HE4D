const express = require('express');
const router = express.Router();
const AdminInvite = require('../../models/admin/AdminInvite');
const adminInviteController = require('../../controllers/admin/adminInviteController');
const adminAuthMiddleware = require('../../middleware/auth/adminAuth');
const { adminRoleCheck } = require('../../middleware/auth/roleCheck');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

router.get('/check/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const invite = await AdminInvite.findOne({ token, status: 'pending' });
  if (!invite) return res.status(404).json({ error: 'Invalid invitation' });
  if (invite.expiresAt < new Date()) {
    invite.status = 'expired';
    await invite.save();
    return res.status(400).json({ error: 'Invitation has expired' });
  }
  res.json({ email: invite.email, role: invite.role });
}));

router.post('/accept-invite', safe(adminInviteController.acceptInvite, 'acceptInvite'));
router.use(adminAuthMiddleware);
router.post('/invite', adminRoleCheck.hasRole('super_admin'), safe(adminInviteController.createInvite, 'createInvite'));
router.get('/invites', adminRoleCheck.hasRole('senior_admin'), safe(adminInviteController.listInvites, 'listInvites'));
router.delete('/invite/:token', adminRoleCheck.hasRole('super_admin'), safe(adminInviteController.cancelInvite, 'cancelInvite'));

module.exports = router;
