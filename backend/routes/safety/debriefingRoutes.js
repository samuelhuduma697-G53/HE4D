const express = require('express');
const router = express.Router();
const debriefingController = require('../../controllers/safety/debriefingController');
const { protect } = require('../../middleware/auth/auth');
const { roleCheck } = require('../../middleware/auth/roleCheck');

const safe = (fn, name) => (req, res, next) => {
  if (typeof fn === 'function') return fn(req, res, next);
  res.status(501).json({ error: `${name} not implemented` });
};

router.use(protect);

router.post('/', roleCheck.isHelper, safe(debriefingController.createDebriefing, 'createDebriefing'));
router.get('/my', roleCheck.isHelper, safe(debriefingController.getMyDebriefings, 'getMyDebriefings'));
router.get('/:debriefingId', roleCheck.isHelper, safe(debriefingController.getDebriefing, 'getDebriefing'));
router.post('/:debriefingId/start', roleCheck.isHelper, safe(debriefingController.startDebriefing, 'startDebriefing'));
router.post('/:debriefingId/complete', roleCheck.isHelper, safe(debriefingController.completeDebriefing, 'completeDebriefing'));
router.post('/:debriefingId/feedback', roleCheck.isHelper, safe(debriefingController.addFeedback, 'addFeedback'));

module.exports = router;
