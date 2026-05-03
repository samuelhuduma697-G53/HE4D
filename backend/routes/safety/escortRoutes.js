const express = require('express');
const router = express.Router();
const escortController = require('../../controllers/safety/escortController');
const { protect } = require('../../middleware/auth/auth');
const { roleCheck } = require('../../middleware/auth/roleCheck');

router.use(protect);

router.post('/activate', roleCheck.isHelper, escortController.activateEscort);
router.post('/location', roleCheck.isHelper, escortController.updateLocation);
router.post('/checkin', roleCheck.isHelper, escortController.checkIn);
router.post('/emergency', roleCheck.isHelper, escortController.emergencyAlert);
router.post('/complete', roleCheck.isHelper, escortController.completeEscort);
router.get('/active', roleCheck.isHelper, escortController.getActiveSession);

module.exports = router;
