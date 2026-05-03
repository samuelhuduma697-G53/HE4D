const express = require('express');
const router = express.Router();
const donationController = require('../../controllers/core/donationController');
const { protect } = require('../../middleware/auth/auth');

// Public routes (no login needed)
router.get('/goals', donationController.getGoals);
router.get('/ledger', donationController.getLedger);
router.post('/mpesa/callback', donationController.mpesaCallback);
router.post('/mpesa/stk-push', donationController.initiateMpesa);

// Protected routes (login required)
router.use(protect);
router.get('/history', donationController.getUserDonations);
router.get('/status/:transactionId', donationController.checkTransactionStatus);

module.exports = router;
