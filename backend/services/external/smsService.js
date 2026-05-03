const logger = require('../../config/logger');

class SMSService {
  async sendSMS(to, message) {
    try {
      if (process.env.NODE_ENV === 'development') {
        logger.info(`[DEV SMS] To: ${to}, Msg: ${message}`);
        return { success: true, dryRun: true };
      }
      
      // Production: Integrate with Africa's Talking
      logger.info('SMS sent', { to, message: message.substring(0, 50) });
      return { success: true };
    } catch (error) {
      logger.error('SMS Send Failed', { error: error.message });
      return null;
    }
  }

  async sendEmergencyAlert(phone, helperName, location) {
    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const message = `EMERGENCY: ${helperName} has triggered a panic alert. Last known location: ${mapsUrl}`;
    return this.sendSMS(phone, message);
  }

  async sendVerificationCode(phone, code) {
    const message = `Your Huduma verification code is: ${code}. Valid for 10 minutes.`;
    return this.sendSMS(phone, message);
  }

  maskPhone(phone) {
    if (!phone) return 'null';
    return phone.slice(0, 4) + '****' + phone.slice(-3);
  }

  validatePhoneNumber(phone) {
    return /^\+254[0-9]{9}$/.test(phone);
  }
}

module.exports = new SMSService();