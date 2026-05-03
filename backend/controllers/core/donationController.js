const Transaction = require('../../models/core/Transaction');
const User = require('../../models/core/User');
const mpesaService = require('../../services/external/mpesaService');
const notificationService = require('../../services/internal/notificationService');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

class DonationController {
  initiateMpesa = asyncHandler(async (req, res) => {
    const { amount, phoneNumber, description } = req.body;
    const userId = req.user?._id;

    if (!amount || amount < 10) {
      return res.status(400).json({ error: 'Minimum donation is KES 10' });
    }

    const transaction = new Transaction({
      type: constants.PAYMENT_TYPES.DONATION,
      amount,
      paymentMethod: 'mpesa',
      donor: userId,
      phoneNumber,
      description: description || 'Huduma Ecosystem Support',
      status: constants.PAYMENT_STATUS.PENDING,
      accountReference: `HUDUMA-${Math.floor(1000 + Math.random() * 9000)}`
    });

    await transaction.save();

    const result = await mpesaService.stkPush(phoneNumber, amount, transaction.accountReference, transaction.description);

    if (!result.success) {
      transaction.status = constants.PAYMENT_STATUS.FAILED;
      await transaction.save();
      return res.status(400).json({ error: 'M-PESA Initiation Failed', details: result.error });
    }

    transaction.mpesaCheckoutRequestId = result.checkoutRequestId;
    await transaction.save();

    res.json({ success: true, checkoutRequestId: result.checkoutRequestId, message: 'STK Push sent to phone' });
  });

  mpesaCallback = asyncHandler(async (req, res) => {
    const result = mpesaService.handleCallback(req.body);
    
    const transaction = await Transaction.findOne({ mpesaCheckoutRequestId: result.checkoutRequestId });
    if (!transaction) return res.status(200).json({ message: 'Transaction not found' });

    if (result.transactionStatus === 'success') {
      transaction.status = constants.PAYMENT_STATUS.COMPLETED;
      transaction.mpesaReceiptNumber = result.transaction?.mpesaReceiptNumber;
      transaction.completedAt = new Date();

      if (transaction.donor) {
        await User.findByIdAndUpdate(transaction.donor, { 
          $inc: { 'profile.totalDonations': transaction.amount } 
        });
        
        await notificationService.sendNotification(
          transaction.donor,
          'donation_successful',
          'Thank You!',
          `Your donation of KES ${transaction.amount} has been received.`
        );
      }
    } else {
      transaction.status = constants.PAYMENT_STATUS.FAILED;
    }

    await transaction.save();
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  });

  getLedger = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;

    const donations = await Transaction.find({
      type: constants.PAYMENT_TYPES.DONATION,
      status: constants.PAYMENT_STATUS.COMPLETED
    })
      .sort({ completedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('donor', 'name title');

    const totals = await Transaction.aggregate([
      { $match: { type: constants.PAYMENT_TYPES.DONATION, status: constants.PAYMENT_STATUS.COMPLETED } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalCount: { $sum: 1 } } }
    ]);

    res.json({
      donations,
      summary: {
        totalAmount: totals[0]?.totalAmount || 0,
        totalDonations: totals[0]?.totalCount || 0
      },
      pagination: { page: parseInt(page), limit: parseInt(limit) }
    });
  });

  getGoals = asyncHandler(async (req, res) => {
    res.json({
      currentGoal: 50000,
      currentRaised: await Transaction.aggregate([
        { $match: { type: constants.PAYMENT_TYPES.DONATION, status: constants.PAYMENT_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(r => r[0]?.total || 0),
      purpose: 'Supporting crisis response in Kilifi County'
    });
  });

  getUserDonations = asyncHandler(async (req, res) => {
    const donations = await Transaction.find({
      donor: req.user._id,
      type: constants.PAYMENT_TYPES.DONATION,
      status: constants.PAYMENT_STATUS.COMPLETED
    }).sort({ completedAt: -1 });

    res.json({ donations });
  });

  checkTransactionStatus = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const tx = await Transaction.findById(transactionId);
    
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    
    res.json({ 
      status: tx.status, 
      receipt: tx.mpesaReceiptNumber,
      amount: tx.amount 
    });
  });
}

module.exports = new DonationController();