const express = require('express');
const router = express.Router();
const matchingController = require('../../controllers/core/matchingController');
const { protect } = require('../../middleware/auth/auth');
const { roleCheck } = require('../../middleware/auth/roleCheck');

router.use(protect);

// Wrap controller methods safely
const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

router.post('/accept/:crisisId', roleCheck.isHelper, safe(matchingController.acceptCrisis, 'acceptCrisis'));
router.post('/decline/:crisisId', roleCheck.isHelper, safe(matchingController.declineCrisis, 'declineCrisis'));
router.post('/arrive/:matchId', roleCheck.isHelper, safe(matchingController.confirmArrival, 'confirmArrival'));
router.get('/active', safe(matchingController.getActiveMatch, 'getActiveMatch'));
router.post('/cancel/:matchId', safe(matchingController.cancelMatch, 'cancelMatch'));
router.get('/my-matches', roleCheck.isHelper, safe(matchingController.getMyMatches, 'getMyMatches'));

module.exports = router;
