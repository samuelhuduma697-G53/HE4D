const express = require('express');
const router = express.Router();
const safetyController = require('../../controllers/safety/safetyController');
const { protect } = require('../../middleware/auth/auth');

const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

router.use(protect);

router.post('/report', safe(safetyController.reportIncident, 'reportIncident'));
router.get('/briefing/:crisisId', safe(safetyController.getSafetyBriefing, 'getSafetyBriefing'));
router.get('/incident/:incidentId', safe(safetyController.getIncident, 'getIncident'));
router.get('/stats', safe(safetyController.getStats, 'getStats'));

module.exports = router;
