const EscortSession = require('../../models/safety/EscortSession');
const Crisis = require('../../models/core/Crisis');
const User = require('../../models/core/User');
const smsService = require('../../services/external/smsService');
const notificationService = require('../../services/internal/notificationService');
const logger = require('../../config/logger');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

class EscortController {
  activateEscort = asyncHandler(async (req, res) => {
    const { crisisId, contacts, checkInInterval = 10 } = req.body;
    const helperId = req.user._id;

    const crisis = await Crisis.findById(crisisId);
    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });

    const existing = await EscortSession.findOne({ helperId, crisisId, status: { $in: ['active', 'paused'] } });
    if (existing) return res.status(400).json({ error: 'Escort mode already active' });

    const escortSession = new EscortSession({
      helperId,
      crisisId,
      checkInInterval,
      status: 'active',
      startedAt: new Date(),
      nextCheckInAt: new Date(Date.now() + checkInInterval * 60 * 1000)
    });

    if (contacts) {
      for (const contact of contacts) {
        await escortSession.addContact(contact.name, contact.phone, contact.relationship);
      }
    }

    await escortSession.save();

    for (const contact of escortSession.contacts) {
      await smsService.sendSMS(
        contact.phone,
        `[Huduma Safety] ${req.user.name} has activated escort mode. They will check in every ${checkInInterval} minutes.`
      );
    }

    res.status(201).json({
      message: 'Escort mode activated',
      sessionId: escortSession._id,
      checkInInterval
    });
  });

  updateLocation = asyncHandler(async (req, res) => {
    const { sessionId, latitude, longitude } = req.body;
    const helperId = req.user._id;

    const session = await EscortSession.findOne({ _id: sessionId, helperId, status: { $in: ['active', 'paused'] } });
    if (!session) return res.status(404).json({ error: 'Active escort session not found' });

    await session.updateLocation([longitude, latitude]);
    res.json({ message: 'Location updated' });
  });

  checkIn = asyncHandler(async (req, res) => {
    const { sessionId, status } = req.body;
    const helperId = req.user._id;

    const session = await EscortSession.findOne({ _id: sessionId, helperId, status: { $in: ['active', 'paused'] } });
    if (!session) return res.status(404).json({ error: 'Active escort session not found' });

    await session.recordCheckIn(status || 'safe');
    res.json({ message: 'Check-in recorded', nextCheckIn: session.nextCheckInAt });
  });

  emergencyAlert = asyncHandler(async (req, res) => {
    const { sessionId, notes, latitude, longitude } = req.body;
    const helperId = req.user._id;

    const session = await EscortSession.findById(sessionId).populate('helperId');
    if (!session) return res.status(404).json({ error: 'Escort session not found' });

    session.status = 'emergency';
    await session.escalate('emergency', notes);

    for (const contact of session.contacts) {
      await smsService.sendSMS(
        contact.phone,
        `[Huduma EMERGENCY] ${session.helperId.name} has activated emergency alert! Location: ${latitude}, ${longitude}`
      );
    }

    await notificationService.sendNotification(
      null, 'emergency_alert', 'EMERGENCY ALERT',
      `Helper ${session.helperId.name} needs immediate assistance.`,
      { sessionId }, true
    );

    res.json({ message: 'Emergency alert sent' });
  });

  completeEscort = asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    const session = await EscortSession.findOne({ _id: sessionId, helperId: req.user._id });
    
    if (!session) return res.status(404).json({ error: 'Escort session not found' });

    await session.complete();

    for (const contact of session.contacts) {
      await smsService.sendSMS(
        contact.phone,
        `[Huduma Safety] ${req.user.name} has safely completed their crisis response.`
      );
    }

    res.json({ message: 'Escort mode completed', duration: session.getDuration() });
  });

  getActiveSession = asyncHandler(async (req, res) => {
    const session = await EscortSession.findOne({
      helperId: req.user._id,
      status: { $in: ['active', 'paused'] }
    }).populate('crisisId', 'rawInput triage location');

    res.json({ active: !!session, session });
  });
}

module.exports = new EscortController();