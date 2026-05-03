const User = require('../../models/core/User');
const Crisis = require('../../models/core/Crisis');
const Match = require('../../models/core/Match');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

class HelperController {
  getProfile = asyncHandler(async (req, res) => {
    const helper = await User.findById(req.user._id).select('-passwordHash');
    if (!helper || helper.role !== 'helper') {
      return res.status(404).json({ error: 'Helper not found' });
    }
    res.json({ helper });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, bio, specializations, languages, maxResponseDistance, livedExperienceDescription } = req.body;
    const helper = await User.findById(req.user._id);
    
    if (!helper || helper.role !== 'helper') {
      return res.status(404).json({ error: 'Helper not found' });
    }

    if (name) helper.name = name;
    if (phone) helper.phone = phone;
    if (bio) helper.profile.bio = bio;
    if (specializations) helper.helperProfile.specializations = specializations;
    if (languages) helper.profile.languages = languages;
    if (maxResponseDistance) helper.helperProfile.maxResponseDistance = maxResponseDistance;
    if (livedExperienceDescription) helper.helperProfile.livedExperienceDescription = livedExperienceDescription;

    await helper.save();
    logger.info('Helper profile updated', { helperId: helper._id });
    res.json({ message: 'Profile updated', helper });
  });

  toggleAvailability = asyncHandler(async (req, res) => {
    const { isAvailable, subCounty, ward } = req.body;
    
    const helper = await User.findByIdAndUpdate(
      req.user._id,
      {
        'helperProfile.isAvailable': isAvailable,
        'location.subCounty': subCounty,
        'location.ward': ward
      },
      { new: true }
    );

    res.json({
      message: 'Availability updated',
      isAvailable: helper.helperProfile.isAvailable,
      ward: helper.location.ward
    });
  });

  getStats = asyncHandler(async (req, res) => {
    const helperId = req.user._id;
    const helper = await User.findById(helperId);

    const totalMatches = await Match.countDocuments({ helperId }) + 
      await Crisis.countDocuments({ 'match.helperId': helperId, status: { $in: ['resolved', 'in_progress'] } });
    const completedMatches = await Match.countDocuments({ helperId, status: 'completed' }) +
      await Crisis.countDocuments({ 'match.helperId': helperId, status: 'resolved' });
    const activeCrises = await Crisis.countDocuments({
      'match.helperId': helperId,
      status: { $in: ['assigned', 'in_progress'] }
    });

    const recentMatches = await Match.find({ helperId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('crisisId', 'rawInput triage status');

    res.json({
      stats: {
        totalCases: totalMatches,
        completedCases: completedMatches,
        activeCrises,
        isAvailable: helper?.helperProfile?.isAvailable || false,
        trustScore: helper?.helperProfile?.trustScore || 0,
        averageRating: helper?.helperProfile?.averageRating || 0
      },
      recentMatches
    });
  });

  getMetrics = asyncHandler(async (req, res) => {
    const helperId = req.user._id;
    
    const responseTimeData = await Match.aggregate([
      { $match: { helperId: helperId, status: 'completed', eta: { $exists: true } } },
      { $group: { _id: null, avgResponseTime: { $avg: '$eta' } } }
    ]);

    res.json({
      performance: {
        averageResponseTime: responseTimeData[0]?.avgResponseTime || 0,
        totalResolved: await Match.countDocuments({ helperId, status: 'completed' })
      }
    });
  });

  uploadDocuments = asyncHandler(async (req, res) => {
    const { documentType, documentUrl } = req.body;
    const helper = await User.findById(req.user._id);

    if (!helper || helper.role !== 'helper') {
      return res.status(404).json({ error: 'Helper not found' });
    }

    if (!helper.helperProfile.verificationDocuments) {
      helper.helperProfile.verificationDocuments = [];
    }

    helper.helperProfile.verificationDocuments.push({
      type: documentType,
      url: documentUrl,
      uploadedAt: new Date()
    });

    await helper.save();
    logger.info('Document uploaded', { helperId: helper._id, documentType });
    res.json({ message: 'Document uploaded', documents: helper.helperProfile.verificationDocuments });
  });

  getVerificationStatus = asyncHandler(async (req, res) => {
    const helper = await User.findById(req.user._id);
    
    if (!helper || helper.role !== 'helper') {
      return res.status(404).json({ error: 'Helper not found' });
    }

    res.json({
      verificationStatus: helper.helperProfile.verificationStatus,
      documentsSubmitted: helper.helperProfile.verificationDocuments?.length || 0,
      trustScore: helper.helperProfile.trustScore,
      verifiedAt: helper.helperProfile.verifiedAt
    });
  });

  getNearbyHelpers = asyncHandler(async (req, res) => {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const helpers = await User.find({
      role: constants.USER_ROLES.HELPER,
      'helperProfile.verificationStatus': 'verified',
      'helperProfile.isAvailable': true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000
        }
      }
    }).select('name location helperProfile.specializations helperProfile.trustScore');

    res.json({ helpers, count: helpers.length, radius });
  });
}

module.exports = new HelperController();