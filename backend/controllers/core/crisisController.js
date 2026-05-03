const Crisis = require('../../models/core/Crisis');
const Match = require('../../models/core/Match');
const User = require('../../models/core/User');
const GuestSession = require('../../models/core/GuestSession');
const matchingService = require('../../services/internal/matchingService');
const aiService = require('../../services/external/aiService');
const notificationService = require('../../services/internal/notificationService');
const geocodingService = require('../../services/internal/geocodingService');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

class CrisisController {

  submitCrisis = asyncHandler(async (req, res) => {
    const { text, latitude, longitude, language, isAnonymous } = req.body;
    const seekerId = req.user?._id || req.user?.id;
    const isGuest = req.user?.isGuest || req.user?.role === 'guest';

    // Guest validation
    if (isGuest) {
      const sessionId = req.user?.sessionId || seekerId;
      const guestSession = await GuestSession.findOne({ sessionId });
      if (!guestSession || !guestSession.isValid()) {
        return res.status(403).json({ error: 'Guest session expired', requiresRegistration: true });
      }
      if (!guestSession.canSubmitCrisis()) {
        return res.status(403).json({ error: 'Guest limit reached', requiresRegistration: true });
      }
    }

    // AI Triage
    const triage = await aiService.classifyCrisis(text, language);

    // Location context
    let locationData = {};
    try {
      locationData = await geocodingService.reverseGeocode(latitude, longitude);
    } catch (e) {
      locationData = geocodingService.kilifiWardLookup(latitude, longitude);
    }

    // Create crisis
    const crisis = new Crisis({
      seekerId: isGuest ? req.user.sessionId : seekerId,
      rawInput: text,
      language: triage.language || language || 'english',
      triage: {
        acuityScore: triage.acuityScore,
        severity: triage.severity,
        categories: triage.categories,
        keywords: triage.keywords,
        requiresImmediate: triage.requiresImmediate,
        confidence: triage.confidence,
        detectedDialect: triage.detectedDialect
      },
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        county: locationData.county || 'Kilifi',
        subCounty: locationData.subCounty || 'Kilifi North',
        ward: locationData.ward || 'Sokoni',
        address: locationData.formattedAddress
      },
      status: constants.CRISIS_STATUS.TRIAGING,
      metadata: {
        isGuestSession: isGuest,
        guestSessionId: isGuest ? req.user.sessionId : null,
        submittedAt: new Date(),
        isAnonymous: isAnonymous || false
      }
    });

    await crisis.save();

    // Increment guest count
    if (isGuest) {
      await GuestSession.findOneAndUpdate(
        { sessionId: req.user.sessionId },
        { $inc: { crisisCount: 1 } }
      );
    }

    // Background matching
    matchingService.alertHelpers(crisis._id).catch(err => logger.error('Matching failed', err));

    // Socket broadcast
    const socketManager = req.app.get('socketManager');
    socketManager.emitToRole('helper', 'new-crisis-nearby', {
      crisisId: crisis._id,
      acuity: triage.acuityScore,
      severity: triage.severity,
      location: locationData.formattedAddress || 'Kilifi'
    });

    logger.info('Crisis submitted', { crisisId: crisis._id, seekerId, isGuest });

    const response = {
      message: 'Crisis submitted successfully',
      crisis: {
        id: crisis._id,
        status: crisis.status,
        triage: { acuityScore: triage.acuityScore, severity: triage.severity, requiresImmediate: triage.requiresImmediate }
      }
    };

    if (isGuest) {
      response.guestInfo = {
        isGuest: true,
        message: 'Register to save your crisis history'
      };
    }

    res.status(201).json(response);
  });

  triggerPanic = asyncHandler(async (req, res) => {
    const { latitude, longitude, text } = req.body;
    const seekerId = req.user?._id || req.user?.id;
    const isGuest = req.user?.isGuest || req.user?.role === 'guest';
    const seeker = isGuest ? { name: req.user?.name || 'Guest' } : await User.findById(seekerId);

    // Derive location from GPS
    let locationData = {};
    try {
      locationData = await geocodingService.reverseGeocode(latitude, longitude);
    } catch (e) {
      locationData = geocodingService.kilifiWardLookup(latitude, longitude);
    }

    const crisis = new Crisis({
      seekerId: isGuest ? req.user?.sessionId : seekerId,
      rawInput: text || 'PANIC BUTTON ACTIVATED',
      triage: { acuityScore: 10, severity: 'critical', categories: ['emergency'], keywords: ['panic'], requiresImmediate: true, confidence: 1.0 },
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        county: locationData.county || 'Kilifi',
        subCounty: locationData.subCounty || 'Kilifi North',
        ward: locationData.ward || 'Sokoni',
        address: locationData.formattedAddress || 'GPS Location, Kilifi'
      },
      status: constants.CRISIS_STATUS.CRITICAL,
      safetyFlags: [{ type: 'emergency', severity: 'critical', alertedAt: new Date(), escalatedTo: ['admin', 'emergency_services'] }],
      metadata: { isGuestSession: isGuest, guestSessionId: isGuest ? req.user?.sessionId : null, isPanic: true, submittedAt: new Date() }
    });

    await crisis.save();

    const socketManager = req.app.get('socketManager');
    socketManager.emitToRole('helper', 'emergency-panic', {
      crisisId: crisis._id,
      seekerName: seeker?.name || 'Anonymous',
      location: { latitude, longitude },
      timestamp: new Date().toISOString()
    });

    if (!isGuest) {
      await notificationService.triggerEmergencyAlert(seekerId, crisis._id, latitude, longitude);
    }

    logger.error('Panic triggered', { crisisId: crisis._id, seekerId });

    res.json({ message: 'Emergency alert sent', crisisId: crisis._id, helperAssigned: true });
  });

  getQueue = asyncHandler(async (req, res) => {
    const helperId = req.user._id;
    const helper = await User.findById(helperId);
    const maxDistance = (helper.helperProfile?.maxResponseDistance || 20) * 1000;

    const crises = await Crisis.find({
      status: { $in: [constants.CRISIS_STATUS.TRIAGING, constants.CRISIS_STATUS.MATCHING] },
      location: { $near: { $geometry: helper.location, $maxDistance: maxDistance } }
    }).sort({ 'triage.acuityScore': -1 }).limit(20);

    res.json({ queue: crises, total: crises.length });
  });

  getCrisis = asyncHandler(async (req, res) => {
    const { crisisId } = req.params;
    const userId = req.user._id?.toString() || req.user.id;
    const crisis = await Crisis.findById(crisisId);
    
    // Manually fetch seeker and helper names since seekerId is String type
    if (crisis) {
      const User = require('../../models/core/User');
      const seeker = await User.findById(crisis.seekerId).select('name phone').catch(() => null);
      const helper = crisis.match?.helperId ? await User.findById(crisis.match.helperId).select('name phone helperProfile').catch(() => null) : null;
      crisis._doc.seekerId = seeker || { name: 'Anonymous', phone: '' };
      if (helper) crisis._doc.match.helperId = helper;
    }

    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });

    let isAuthorized = false;
    if (crisis.metadata?.isGuestSession) {
      isAuthorized = crisis.metadata.guestSessionId === req.user?.sessionId;
    } else {
      isAuthorized = crisis.seekerId?._id?.toString() === userId ||
                     crisis.match?.helperId?._id?.toString() === userId ||
                     req.user?.role === 'admin';
    }

    if (!isAuthorized) return res.status(403).json({ error: 'Access denied' });
    res.json({ crisis });
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { crisisId } = req.params;
    const { status, notes } = req.body;
    const crisis = await Crisis.findById(crisisId);
    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
    if (crisis.match?.helperId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not assigned to this crisis' });
    }

    // If requesting resolve, check contact was made
    if (status === constants.CRISIS_STATUS.RESOLVED) {
      const hasChat = crisis.chatHistory?.length > 0;
      const hasCall = crisis.metadata?.callOccurred;
      
      if (!hasChat && !hasCall) {
        return res.status(400).json({ 
          error: 'Contact required', 
          message: 'Please chat or call the seeker before marking as resolved.' 
        });
      }

      // Request admin verification
      crisis.status = 'pending_resolution';
      crisis.resolutionRequestedAt = new Date();
      crisis.resolutionRequestedBy = req.user._id;
      await crisis.save();
      
      return res.json({ 
        message: 'Resolution requested. Waiting for admin verification.', 
        status: 'pending_resolution',
        requiresAdmin: true 
      });
    }

    await crisis.addTimelineEntry(status, notes, req.user._id);
    res.json({ message: 'Status updated', status: crisis.status });
  });

  getHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    const isGuest = req.user?.isGuest || req.user?.role === 'guest';
    const query = isGuest ? { 'metadata.guestSessionId': req.user?.sessionId } : { seekerId: userId };
    const crises = await Crisis.find(query)
      .sort({ createdAt: -1 })
      .select('_id rawInput triage.acuityScore triage.severity status createdAt metadata location');
    res.json({ crises });
  });
}

module.exports = new CrisisController();
