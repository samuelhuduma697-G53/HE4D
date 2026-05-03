const mongoose = require('mongoose');
const constants = require('../../config/constants');

const backupCodeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  used: { type: Boolean, default: false }
});

const admin2FASchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true,
    index: true
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  method: {
    type: String,
    enum: ['authenticator', 'sms'],
    default: 'authenticator'
  },
  secret: {
    type: String,
    default: null
  },
  backupCodes: [backupCodeSchema],
  phoneNumber: String,
  maskedPhone: String,
  verifiedAt: Date
}, { timestamps: true });

admin2FASchema.methods.generateBackupCodes = function() {
  const crypto = require('crypto');
  const codes = [];
  for (let i = 0; i < constants.TWO_FA.BACKUP_CODE_COUNT; i++) {
    codes.push({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false
    });
  }
  this.backupCodes = codes;
  return codes.map(c => c.code);
};

admin2FASchema.methods.verifyBackupCode = function(code) {
  const backupCode = this.backupCodes.find(bc => bc.code === code && !bc.used);
  if (backupCode) {
    backupCode.used = true;
    return true;
  }
  return false;
};

admin2FASchema.methods.getRemainingBackupCodesCount = function() {
  return this.backupCodes.filter(bc => !bc.used).length;
};

admin2FASchema.methods.enable = async function() {
  this.isEnabled = true;
  this.verifiedAt = new Date();
  await this.save();
};

admin2FASchema.methods.disable = async function() {
  this.isEnabled = false;
  await this.save();
};

admin2FASchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.secret;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Admin2FA', admin2FASchema);