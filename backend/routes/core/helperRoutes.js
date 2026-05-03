const express = require('express');
const router = express.Router();
const helperController = require('../../controllers/core/helperController');
const { protect } = require('../../middleware/auth/auth');
const { roleCheck } = require('../../middleware/auth/roleCheck');

router.use(protect);

// Routes for ALL helpers (including pending/unverified)
router.get('/verification-status', roleCheck.isHelperOrPending, helperController.getVerificationStatus);
router.get('/profile', roleCheck.isHelperOrPending, helperController.getProfile);
router.put('/profile', roleCheck.isHelperOrPending, helperController.updateProfile);
router.get('/stats', roleCheck.isHelperOrPending, helperController.getStats);
router.post('/documents', roleCheck.isHelperOrPending, helperController.uploadDocuments);

// Routes for VERIFIED helpers only
router.patch('/availability', roleCheck.isHelper, helperController.toggleAvailability);
router.get('/metrics', roleCheck.isHelper, helperController.getMetrics);

module.exports = router;
