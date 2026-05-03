const PeerSupport = require('../../models/safety/PeerSupport');
const User = require('../../models/core/User');
const Crisis = require('../../models/core/Crisis');
const notificationService = require('../../services/internal/notificationService');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

class PeerSupportController {
  requestSupport = asyncHandler(async (req, res) => {
    const { crisisId, supportType, urgency, description } = req.body;
    const requesterId = req.user._id;

    const crisis = await Crisis.findById(crisisId);
    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });

    const existing = await PeerSupport.findOne({
      requesterId,
      crisisId,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });
    if (existing) return res.status(400).json({ error: 'Active support request already exists' });

    const supportRequest = new PeerSupport({
      requesterId,
      crisisId,
      supportType,
      urgency: urgency || 'normal',
      description,
      status: 'pending',
      requestedAt: new Date()
    });

    await supportRequest.save();
    await this.notifyAvailableSupporters(supportRequest, crisis.location?.county);

    res.status(201).json({ message: 'Support request created', requestId: supportRequest._id });
  });

  acceptRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const supporterId = req.user._id;

    const request = await PeerSupport.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Request unavailable or already accepted' });
    }

    await request.accept(supporterId);

    const supporter = await User.findById(supporterId);
    await notificationService.sendNotification(
      request.requesterId,
      'peer_support_accepted',
      'Peer Support Accepted',
      `${supporter.name} is ready to assist you.`,
      { requestId }
    );

    res.json({ message: 'Request accepted', status: request.status });
  });

  startSession = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const request = await PeerSupport.findById(requestId);

    if (!request || request.status !== 'accepted') {
      return res.status(400).json({ error: 'Request must be accepted first' });
    }

    await request.start();
    request.chatSessionId = `peer_chat_${requestId}_${Date.now()}`;
    await request.save();

    res.json({ chatSessionId: request.chatSessionId, status: request.status });
  });

  completeSession = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const request = await PeerSupport.findById(requestId);

    if (!request) return res.status(404).json({ error: 'Request not found' });

    await request.complete();

    await User.findByIdAndUpdate(request.supporterId, {
      $inc: { 'helperProfile.trustScore': 0.5 }
    });

    res.json({ message: 'Session completed' });
  });

  addMessage = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { message } = req.body;

    const request = await PeerSupport.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await request.addMessage(req.user._id, message);
    res.json({ message: 'Message sent' });
  });

  getMyRequests = asyncHandler(async (req, res) => {
    const requests = await PeerSupport.find({
      $or: [{ requesterId: req.user._id }, { supporterId: req.user._id }]
    })
      .populate('requesterId', 'name email')
      .populate('supporterId', 'name email')
      .populate('crisisId', 'rawInput triage')
      .sort({ createdAt: -1 });

    res.json({ requests });
  });

  async notifyAvailableSupporters(request, county = 'Kilifi') {
    const helpers = await User.find({
      role: 'helper',
      'helperProfile.verificationStatus': 'verified',
      'location.county': county,
      _id: { $ne: request.requesterId }
    }).limit(15);

    for (const helper of helpers) {
      await notificationService.sendNotification(
        helper._id,
        'peer_support_request',
        request.urgency === 'high' ? 'URGENT: Peer Support Needed' : 'Peer Support Request',
        `A helper in ${county} needs ${request.supportType} assistance.`,
        { requestId: request._id }
      );
    }
  }
}

module.exports = new PeerSupportController();