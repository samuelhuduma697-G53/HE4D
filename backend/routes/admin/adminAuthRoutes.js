const express = require('express');
const router = express.Router();
const adminAuthController = require('../../controllers/admin/adminAuthController');
const adminAuthMiddleware = require('../../middleware/auth/adminAuth');
const { authLimiter } = require('../../middleware/security/rateLimiter');

// Bind controller methods to preserve `this` context
const login = adminAuthController.login.bind(adminAuthController);
const verify2FA = adminAuthController.verify2FA.bind(adminAuthController);
const logout = adminAuthController.logout.bind(adminAuthController);
const refreshToken = adminAuthController.refreshToken.bind(adminAuthController);
const get2FAStatus = adminAuthController.get2FAStatus.bind(adminAuthController);
const setup2FA = adminAuthController.setup2FA.bind(adminAuthController);
const enable2FA = adminAuthController.enable2FA.bind(adminAuthController);
const disable2FA = adminAuthController.disable2FA.bind(adminAuthController);

router.post('/login', authLimiter, login);
router.post('/verify-2fa', authLimiter, verify2FA);
router.post('/logout', adminAuthMiddleware, logout);
router.post('/refresh', adminAuthMiddleware, refreshToken);
router.get('/2fa-status', adminAuthMiddleware, get2FAStatus);
router.post('/setup-2fa', adminAuthMiddleware, setup2FA);
router.post('/enable-2fa', adminAuthMiddleware, enable2FA);
router.post('/disable-2fa', adminAuthMiddleware, disable2FA);

module.exports = router;
