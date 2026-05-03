const User = require('../../models/core/User');
const jwt = require('jsonwebtoken');
const logger = require('../../config/logger');
const emailService = require('../../services/external/emailService');
const constants = require('../../config/constants');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

// Guest session
const crypto = require('crypto');
const GuestSession = require('../../models/core/GuestSession');
const Crisis = require('../../models/core/Crisis');

// Add these methods to AuthController

/**
 * Create a guest session for try-before-register
 * Allows one crisis submission without full registration
 */
guestSession: asyncHandler(async (req, res) => {
  const { name, phone, deviceId } = req.body;
  
  // Generate unique session identifiers
  const sessionId = crypto.randomBytes(16).toString('hex');
  const guestToken = jwt.sign(
    { 
      sessionId,
      role: 'guest', 
      isGuest: true,
      name: name || 'Guest User',
      phone: phone || null
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  
  // Create guest session record
  const guestSession = new GuestSession({
    sessionId,
    guestToken,
    name: name || 'Guest User',
    phone: phone || null,
    deviceId: deviceId || null,
    crisisCount: 0,
    maxCrises: 1,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  await guestSession.save();
  
  logger.info('Guest session created', { sessionId, ip: req.ip });
  
  res.json({
    success: true,
    token: guestToken,
    sessionId,
    expiresAt,
    user: { 
      id: sessionId, 
      name: name || 'Guest User', 
      role: 'guest',
      isGuest: true 
    },
    remainingCrises: 1,
    message: 'Guest session created. You can submit one crisis as a test.'
  });
})

/**
 * Check guest session status
 */
getGuestSessionStatus: asyncHandler(async (req, res) => {
  const sessionId = req.user.sessionId || req.user.id;
  
  const session = await GuestSession.findOne({ 
    sessionId,
    expiresAt: { $gt: new Date() }
  });
  
  if (!session) {
    return res.status(404).json({ 
      error: 'Session expired or not found',
      requiresRegistration: true 
    });
  }
  
  res.json({
    success: true,
    remainingCrises: session.maxCrises - session.crisisCount,
    expiresAt: session.expiresAt,
    name: session.name
  });
})

/**
 * Migrate guest session data to registered user account
 */
migrateGuestSession: asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user._id;
  
  // Find guest session
  const guestSession = await GuestSession.findOne({ 
    sessionId,
    expiresAt: { $gt: new Date() }
  });
  
  if (!guestSession) {
    return res.status(404).json({ error: 'Guest session not found or expired' });
  }
  
  // Find all crises submitted by this guest session
  const guestCrises = await Crisis.find({ 
    'seekerId': sessionId,
    'metadata.isGuestSession': true 
  });
  
  // Migrate crises to registered user
  const migratedCrises = [];
  for (const crisis of guestCrises) {
    crisis.seekerId = userId;
    crisis.metadata = {
      ...crisis.metadata,
      migratedFromGuest: true,
      originalSessionId: sessionId,
      migratedAt: new Date()
    };
    await crisis.save();
    migratedCrises.push(crisis._id);
  }
  
  // Mark guest session as migrated
  guestSession.migratedTo = userId;
  guestSession.migratedAt = new Date();
  await guestSession.save();
  
  logger.info('Guest session migrated', { 
    sessionId, 
    userId, 
    crisesCount: migratedCrises.length 
  });
  
  res.json({
    success: true,
    message: 'Your test data has been migrated to your account',
    migratedCrises: migratedCrises.length,
    crisesIds: migratedCrises
  });
})

/**
 * Clean up expired guest sessions (cron job)
 */
cleanupGuestSessions: asyncHandler(async (req, res) => {
  const result = await GuestSession.deleteMany({
    expiresAt: { $lt: new Date() },
    migratedTo: { $exists: false }
  });
  
  logger.info('Guest sessions cleanup completed', { deletedCount: result.deletedCount });
  
  res.json({
    success: true,
    deletedCount: result.deletedCount
  });
})

const AuthController = {
  registerSeeker: asyncHandler(async (req, res) => {
    const { name, email, phone, password, county, subCounty, ward, language } = req.body;
    
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ 
      $or: [{ email: normalizedEmail }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email or phone already registered' });
    }

    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      passwordHash: password,
      role: constants.USER_ROLES.SEEKER,
      profile: { languages: language ? [language] : ['swahili'] },
      location: { county: county || 'Kilifi', subCounty, ward }
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name, email: normalizedEmail, role: user.role }
    });
  }),

  registerHelper: asyncHandler(async (req, res) => {
    const {
      title, name, email, phone, password,
      nationalId, experienceType, yearsOfExperience,
      professionalType, specializations, languages,
      county, subCounty, ward, bio
    } = req.body;

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ 
      $or: [{ email: normalizedEmail }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      title,
      name,
      email: normalizedEmail,
      phone,
      passwordHash: password,
      role: constants.USER_ROLES.HELPER,
      profile: { bio, languages: languages || ['swahili'] },
      location: { county: county || 'Kilifi', subCounty, ward },
      helperProfile: {
        nationalId,
        experienceType,
        yearsOfExperience,
        professionalType,
        specializations,
        verificationStatus: 'pending'
      }
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      message: 'Registration successful. Awaiting verification.',
      user: {
        id: user._id,
        name: `${user.title} ${user.name}`,
        email: normalizedEmail,
        role: user.role,
        verificationStatus: 'pending'
      }
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Please provide credentials' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone }
      ]
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ error: 'Account locked. Try again later.' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      await user.recordFailedAttempt();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await user.resetFailedAttempts();
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        helperProfile: user.helperProfile
      }
    });
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User session not found' });
    res.status(200).json({ success: true, user });
  }),

  logout: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Successfully logged out' });
  }),

  verifyEmail: asyncHandler(async (req, res) => {
  const { token } = req.query;
  
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  
  res.json({ success: true, message: 'Email verified successfully' });
}),

forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      // Send email
      emailService.sendPasswordReset(user.email, user.name, resetToken).catch(e => logger.error('Reset email failed:', e));
    }
    res.json({ message: 'If an account exists, a reset link has been sent.' });
}),

resetPassword: asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  });
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  
  user.passwordHash = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
  
  res.json({ success: true, message: 'Password reset successfully' });
}),

  refreshToken: asyncHandler(async (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ success: true, token });
  })
};

module.exports = AuthController;