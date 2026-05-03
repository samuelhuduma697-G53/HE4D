const nodemailer = require('nodemailer');
const logger = require('../../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.SMTP_FROM || 'noreply@huduma.ke';
    this.init();
  }

  init() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      logger.info('Email service initialized');
    } else {
      logger.warn('Email service not configured - emails will be logged only');
    }
  }

  async send(to, subject, html) {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({ from: this.from, to, subject, html });
        logger.info(`Email sent to ${to}: ${subject}`);
      } else {
        logger.info(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
      }
      return { success: true };
    } catch (error) {
      logger.error('Email send failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordReset(email, name, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = 'Huduma Ecosystem - Password Reset';
    const html = `
      <h2>Password Reset</h2>
      <p>Hello ${name || 'there'},</p>
      <p>You requested a password reset. Click below to reset:</p>
      <p><a href="${resetUrl}" style="background:#F5B041;color:#000;padding:10px 20px;text-decoration:none;border-radius:8px;">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
      <hr>
      <p style="color:#666;">Huduma Ecosystem - Crisis Support Platform</p>
    `;
    return this.send(email, subject, html);
  }

  async sendVerificationEmail(email, name, token) {
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const subject = 'Huduma Ecosystem - Verify Your Email';
    const html = `
      <h2>Verify Your Email</h2>
      <p>Hello ${name || 'there'},</p>
      <p>Click below to verify your email:</p>
      <p><a href="${verifyUrl}" style="background:#F5B041;color:#000;padding:10px 20px;text-decoration:none;border-radius:8px;">Verify Email</a></p>
    `;
    return this.send(email, subject, html);
  }
}

module.exports = new EmailService();
