const express = require('express');
const router = express.Router();
const peerSupportController = require('../../controllers/safety/peerSupportController');
const { protect } = require('../../middleware/auth/auth');
const { roleCheck } = require('../../middleware/auth/roleCheck');

router.use(protect);

router.post('/request', roleCheck.isHelper, peerSupportController.requestSupport);
router.post('/:requestId/accept', roleCheck.isHelper, peerSupportController.acceptRequest);
router.post('/:requestId/start', roleCheck.isHelper, peerSupportController.startSession);
router.post('/:requestId/complete', roleCheck.isHelper, peerSupportController.completeSession);
router.post('/:requestId/message', roleCheck.isHelper, peerSupportController.addMessage);
router.get('/my-requests', roleCheck.isHelper, peerSupportController.getMyRequests);

module.exports = router;