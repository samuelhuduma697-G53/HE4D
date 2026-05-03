const Admin = require('../../models/admin/Admin');
const AdminSession = require('../../models/admin/AdminSession');
const Admin2FA = require('../../models/admin/Admin2FA');
const AdminAuditLog = require('../../models/admin/AdminAuditLog');
const admin2FAService = require('../../services/admin/admin2FAService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../../config/logger');
const constants = require('../../config/constants');

class AdminAuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const admin = await Admin.findOne({ email: email.toLowerCase() });
      
      if (!admin) {
        // await this.logFailedLogin(email, ipAddress, 'Admin not found');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (admin.isAccountLocked()) {
        return res.status(423).json({ error: 'Account locked', lockedUntil: admin.lockedUntil });
      }

      const isValid = await admin.comparePassword(password);
      if (!isValid) {
        await admin.recordFailedAttempt();
        // await this.logFailedLogin(email, ipAddress, 'Invalid password');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await admin.resetFailedAttempts();

      const twoFA = await Admin2FA.findOne({ adminId: admin._id });
      if (twoFA && twoFA.isEnabled) {
        const challenge = await admin2FAService.createChallenge(admin._id);
        return res.json({ requires2FA: true, challengeId: challenge.id, method: twoFA.method });
      }

      const session = await this.completeLogin(admin, ipAddress, userAgent);
      res.json({
        token: session.token,
        refreshToken: session.refreshToken,
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role.role }
      });
    } catch (error) {
      logger.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async verify2FA(req, res) {
    try {
      const { challengeId, code } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const challenge = await admin2FAService.verifyChallenge(challengeId, code);
      if (!challenge.valid) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }

      const admin = await Admin.findById(challenge.adminId);
      const session = await this.completeLogin(admin, ipAddress, userAgent);
      session.twoFAVerified = true;
      await session.save();

      res.json({
        token: session.token,
        refreshToken: session.refreshToken,
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role.role }
      });
    } catch (error) {
      logger.error('2FA verification error:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  }

  async completeLogin(admin, ipAddress, userAgent) {
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ipAddress;
    await admin.save();

    const session = new AdminSession({
      adminId: admin._id,
      token: jwt.sign({ id: admin._id, role: admin.role.role }, process.env.JWT_SECRET, { expiresIn: '8h' }),
      refreshToken: crypto.randomBytes(40).toString('hex'),
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
    });
    await session.save();

    await AdminAuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      adminRole: admin.role.role,
      action: 'login',
      ipAddress,
      userAgent,
      status: 'success'
    });

    return session;
  }

  async logout(req, res) {
    try {
      const { sessionId } = req.body;
      await AdminSession.findByIdAndUpdate(sessionId, { isActive: false, terminatedAt: new Date() });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async refreshToken(req, res) {
    try {
      const token = jwt.sign(
        { id: req.admin.id, role: req.admin.role.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({ success: true, token });
    } catch (error) {
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  async setup2FA(req, res) {
    try {
      const { secret, qrCode } = await admin2FAService.generateSecret(req.admin._id, req.admin.email);
      res.json({ secret, qrCode });
    } catch (error) {
      res.status(500).json({ error: '2FA setup failed' });
    }
  }

  async enable2FA(req, res) {
    try {
      const { code } = req.body;
      const backupCodes = await admin2FAService.enable2FA(req.admin._id, code);
      res.json({ message: '2FA enabled', backupCodes });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async disable2FA(req, res) {
    try {
      const { code } = req.body;
      await admin2FAService.disable2FA(req.admin._id, code);
      res.json({ message: '2FA disabled' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async get2FAStatus(req, res) {
    try {
      const status = await admin2FAService.getStatus(req.admin._id);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get 2FA status' });
    }
  }

  async forgotPassword(req, res) {
    res.status(501).json({ error: 'Not implemented' });
  }

  async resetPassword(req, res) {
    res.status(501).json({ error: 'Not implemented' });
  }

  async logFailedLogin(email, ipAddress, reason) {
    await AdminAuditLog.create({
      adminEmail: email,
      action: 'login_failed',
      details: { reason },
      ipAddress,
      userAgent: 'unknown',
      status: 'failure',
      errorMessage: reason
    });
  }
}

module.exports = new AdminAuthController();