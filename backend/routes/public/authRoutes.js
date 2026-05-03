const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { protect } = require('../../middleware/auth/auth');
const { validators, validate } = require('../../middleware/validation/validation');
const { authLimiter } = require('../../middleware/security/rateLimiter');

const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

const safeValidate = (validatorName) => (req, res, next) => {
  if (validators && validators[validatorName]) {
    return validate(validators[validatorName])(req, res, next);
  }
  next();
};

router.post('/register/seeker', authLimiter, safeValidate('registerSeeker'), safe(authController.registerSeeker, 'registerSeeker'));
router.post('/register/helper', authLimiter, safeValidate('registerHelper'), safe(authController.registerHelper, 'registerHelper'));
router.post('/login', authLimiter, safeValidate('userLogin'), safe(authController.login, 'login'));
router.post('/forgot-password', authLimiter, safe(authController.forgotPassword, 'forgotPassword'));
router.post('/reset-password', authLimiter, safe(authController.resetPassword, 'resetPassword'));
router.post('/guest-session', authLimiter, safe(authController.guestSession, 'guestSession'));

router.use((req, res, next) => {
  if (typeof protect === 'function') return protect(req, res, next);
  req.user = { _id: 'dev', role: 'seeker', name: 'Dev User' };
  next();
});

router.get('/me', safe(authController.getMe, 'getMe'));
router.get('/profile', safe(authController.getProfile, 'getProfile'));
router.patch('/profile', safe(authController.updateProfile, 'updateProfile'));
router.post('/logout', safe(authController.logout, 'logout'));
router.post('/refresh', safe(authController.refreshToken, 'refreshToken'));
router.get('/verify-email', safe(authController.verifyEmail, 'verifyEmail'));
router.get('/guest-session/status', safe(authController.getGuestSessionStatus, 'getGuestSessionStatus'));
router.post('/guest-session/migrate', safe(authController.migrateGuestSession, 'migrateGuestSession'));

module.exports = router;
