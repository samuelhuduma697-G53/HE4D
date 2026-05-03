const express = require('express');
const router = express.Router();
const crisisController = require('../../controllers/core/crisisController');
const { protect } = require('../../middleware/auth/auth');
const { roleCheck } = require('../../middleware/auth/roleCheck');
const { validators, validate } = require('../../middleware/validation/validation');
const { crisisLimiter } = require('../../middleware/security/rateLimiter');

router.use(protect);

router.post('/submit', roleCheck.isSeeker, crisisLimiter, validate(validators.submitCrisis), crisisController.submitCrisis);
router.post('/panic', roleCheck.isSeeker, crisisController.triggerPanic);
router.get('/queue', roleCheck.isHelper, crisisController.getQueue);
router.get('/:crisisId', crisisController.getCrisis);
router.patch('/:crisisId/status', roleCheck.isHelper, crisisController.updateStatus);
router.get('/history/mine', crisisController.getHistory);

module.exports = router;
