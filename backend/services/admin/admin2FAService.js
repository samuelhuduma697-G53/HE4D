const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Admin2FA = require('../../models/admin/Admin2FA');
const logger = require('../../config/logger');
const constants = require('../../config/constants');

class Admin2FAService {
  constructor() {
    this.challenges = new Map();
    
    if (!global.twoFACleanupStarted) {
      setInterval(() => this.cleanupChallenges(), 10 * 60 * 1000);
      global.twoFACleanupStarted = true;
    }
  }

  async generateSecret(adminId, email) {
    const secret = speakeasy.generateSecret({
      name: `Huduma Ecosystem (${email})`,
      issuer: 'Huduma Admin'
    });
    
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    await Admin2FA.findOneAndUpdate(
      { adminId },
      { secret: secret.base32, isEnabled: false },
      { upsert: true }
    );
    
    return { secret: secret.base32, qrCode };
  }

  verifyCode(secret, code) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1
    });
  }

  async enable2FA(adminId, code) {
    const twoFA = await Admin2FA.findOne({ adminId });
    if (!twoFA || !twoFA.secret) throw new Error('2FA not initialized');

    const isValid = this.verifyCode(twoFA.secret, code);
    if (!isValid) throw new Error('Invalid verification code');

    const backupCodes = twoFA.generateBackupCodes();
    await twoFA.enable();
    return backupCodes;
  }

  async disable2FA(adminId, code) {
    const twoFA = await Admin2FA.findOne({ adminId });
    if (!twoFA || !twoFA.isEnabled) throw new Error('2FA not enabled');

    const isValid = this.verifyCode(twoFA.secret, code);
    if (!isValid) throw new Error('Invalid verification code');

    await twoFA.disable();
    return true;
  }

  async createChallenge(adminId) {
    const challengeId = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + (5 * 60 * 1000);
    this.challenges.set(challengeId, { adminId, expiresAt });
    return { id: challengeId, expiresAt };
  }

  async verifyChallenge(challengeId, code) {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return { valid: false, error: 'Challenge expired or not found' };
    if (challenge.expiresAt < Date.now()) {
      this.challenges.delete(challengeId);
      return { valid: false, error: 'Challenge expired' };
    }

    const twoFA = await Admin2FA.findOne({ adminId: challenge.adminId });
    const isValidTOTP = this.verifyCode(twoFA.secret, code);
    const isValidBackup = twoFA.verifyBackupCode(code);

    if (isValidTOTP || isValidBackup) {
      this.challenges.delete(challengeId);
      return { valid: true, adminId: challenge.adminId };
    }

    return { valid: false, error: 'Invalid code' };
  }

  async getStatus(adminId) {
    const twoFA = await Admin2FA.findOne({ adminId });
    return {
      enabled: twoFA?.isEnabled || false,
      method: twoFA?.method || 'authenticator',
      verifiedAt: twoFA?.verifiedAt || null,
      remainingBackupCodes: twoFA ? twoFA.backupCodes.filter(bc => !bc.used).length : 0
    };
  }

  cleanupChallenges() {
    const now = Date.now();
    for (const [id, challenge] of this.challenges) {
      if (challenge.expiresAt < now) this.challenges.delete(id);
    }
  }
}

module.exports = new Admin2FAService();