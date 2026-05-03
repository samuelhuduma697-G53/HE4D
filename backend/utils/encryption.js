/**
 * Encryption Utilities
 * Handles data encryption and decryption for sensitive information
 */

const crypto = require('crypto');
const logger = require('../config/logger');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    
    // Ensure key is exactly 32 bytes for aes-256
    const rawKey = process.env.ENCRYPTION_KEY || 'default_32_char_secret_key_for_dev_';
    this.key = crypto.createHash('sha256').update(String(rawKey)).digest();
  }

  /**
   * Encrypt data
   */
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      const result = {
        e: encrypted,
        i: iv.toString('hex'),
        t: authTag.toString('hex')
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      logger.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    try {
      const { e, i, t } = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
      
      const decipher = crypto.createDecipheriv(
        this.algorithm, 
        this.key, 
        Buffer.from(i, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(t, 'hex'));
      
      let decrypted = decipher.update(e, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Hash data (one-way)
   */
  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate OTP
   */
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  /**
   * Mask sensitive data
   */
  maskEmail(email) {
    if (!email) return null;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    const maskedLocal = local.slice(0, 2) + '****' + local.slice(-2);
    return `${maskedLocal}@${domain}`;
  }

  maskPhone(phone) {
    if (!phone) return null;
    if (phone.length <= 6) return phone;
    return phone.slice(0, 4) + '****' + phone.slice(-3);
  }

  maskNationalId(id) {
    if (!id) return null;
    if (id.length <= 4) return id;
    return id.slice(0, 2) + '****' + id.slice(-2);
  }

  /**
   * Sanitize input (XSS protection)
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }
}

module.exports = new EncryptionService();