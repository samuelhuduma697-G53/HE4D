const Match = require('../../models/core/Match');
const Crisis = require('../../models/core/Crisis');
const User = require('../../models/core/User');
const notificationService = require('../../services/internal/notificationService');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

class MatchingController {
  // Accept a crisis from the queue
  acceptCrisis = asyncHandler(async (req, res) => {
    const { crisisId } = req.params;
    const helperId = req.user._id;

    const crisis = await Crisis.findById(crisisId);
    if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
    if (crisis.status === 'assigned' || crisis.status === 'in_progress') {
      return res.status(409).json({ error: 'Crisis already assigned' });
    }

    const helper = await User.findById(helperId);
    const distance = this.calcDistance(
      crisis.location.coordinates[1], crisis.location.coordinates[0],
      helper.location?.coordinates?.[1] || 0, helper.location?.coordinates?.[0] || 0
    );
    const eta = Math.ceil((distance / 35) * 60) + 5;

    // Create match
    const match = await Match.create({
      crisisId: crisis._id,
      seekerId: crisis.seekerId,
      helperId: helper._id,
      matchScore: Math.min(100, Math.round(50 + distance * 2)),
      distance: Math.round(distance * 10) / 10,
      status: constants.MATCH_STATUS.ACCEPTED
    });

    // Update crisis
    crisis.match = { helperId, matchScore: match.matchScore, distance: match.distance, assignedAt: new Date(), acceptedAt: new Date() };
    crisis.status = constants.CRISIS_STATUS.IN_PROGRESS;
    crisis.timeline.push({
      status: 'in_progress',
      timestamp: new Date(),
      note: `Accepted by ${helper.name}`,
      actor: helperId
    });
    await crisis.save();

    // Notify seeker
    notificationService.notifySeekerHelperAccepted(crisis.seekerId, crisis._id, helper.name, eta).catch(() => {});

    logger.info(`Crisis ${crisisId} accepted by helper ${helperId}, ETA: ${eta}min`);

    res.json({ message: 'Crisis accepted', crisis: { id: crisis._id, status: crisis.status, eta, helperName: helper.name }, matchId: match._id });
  });

  // Decline a crisis
  declineCrisis = asyncHandler(async (req, res) => {
    const { crisisId } = req.params;
    res.json({ message: 'Crisis declined' });
  });

  // Confirm arrival at seeker location
  confirmArrival = asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    match.journey = match.journey || {};
    match.journey.helperArrivedAt = new Date();
    await match.save();
    res.json({ message: 'Arrival confirmed' });
  });

  // Get active match for current user
  getActiveMatch = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const role = req.user.role;
    
    // First try Match collection
    const query = role === 'helper' ? { helperId: userId, status: { $in: ['accepted', 'in_progress'] } } : { seekerId: userId, status: { $in: ['accepted', 'in_progress'] } };
    let active = await Match.findOne(query).populate('crisisId seekerId helperId');
    
    // If no Match, check Crisis directly
    if (!active) {
      const Crisis = require('../../models/core/Crisis');
      const crisisQuery = role === 'helper' ? { 'match.helperId': userId, status: { $in: ['assigned', 'in_progress'] } } : { seekerId: userId.toString(), status: { $in: ['assigned', 'in_progress'] } };
      const crisis = await Crisis.findOne(crisisQuery);
      if (crisis) {
        active = { crisisId: crisis, seekerId: crisis.seekerId, helperId: crisis.match?.helperId, status: crisis.status };
      }
    }
    
    res.json({ activeMatch: active || null });
  });

  // Cancel a match
  cancelMatch = asyncHandler(async (req, res) => {
    const { matchId } = req.params;
    await Match.findByIdAndUpdate(matchId, { status: 'cancelled' });
    res.json({ message: 'Match cancelled' });
  });

  // Get helper's match history
  getMyMatches = asyncHandler(async (req, res) => {
    const matches = await Match.find({ helperId: req.user._id }).populate('crisisId').sort({ createdAt: -1 }).limit(20);
    res.json({ matches });
  });

  // Helper: calculate distance between two coordinates
  calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

module.exports = new MatchingController();
