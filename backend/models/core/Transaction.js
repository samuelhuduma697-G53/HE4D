const mongoose = require('mongoose');
const constants = require('../../config/constants');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    enum: Object.values(constants.PAYMENT_TYPES),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank'],
    default: 'mpesa'
  },
  phoneNumber: String,
  accountReference: String,
  description: String,
  status: {
    type: String,
    enum: Object.values(constants.PAYMENT_STATUS),
    default: constants.PAYMENT_STATUS.PENDING,
    index: true
  },
  mpesaCheckoutRequestId: String,
  mpesaMerchantRequestId: String,
  mpesaReceiptNumber: String,
  category: String,
  vendor: String,
  receiptUrl: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  completedAt: Date
}, { timestamps: true });

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ mpesaCheckoutRequestId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);