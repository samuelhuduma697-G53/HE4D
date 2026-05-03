/**
 * Matching Service - Huduma Ecosystem
 * Pairs crisis seekers with the most appropriate helpers using Potential-First algorithm
 */

const User = require('../../models/core/User');
const Crisis = require('../../models/core/Crisis');
const Match = require('../../models/core/Match');
const logger = require('../../config/logger');
const constants = require('../../config/constants');

class MatchingService {
  /**
   * Find best helpers for a crisis and alert them
   */
  async alertHelpers(crisisId) {
    try {
      const crisis = await Crisis.findById(crisisId);
      if (!crisis) {
        logger.error('Crisis not found for matching:', crisisId);
        return;
      }

      const helpers = await this.findMatches(crisis);
      
      if (helpers.length === 0) {
        logger.warn('No helpers found for crisis:', crisisId);
        return;
      }

      // Notify top 3 helpers
      const topHelpers = helpers.slice(0, 3);
      for (const h of topHelpers) {
        await this.createMatch(crisis, h.helper, h);
      }

      logger.info(`Alerted ${topHelpers.length} helpers for crisis ${crisisId}`);
    } catch (error) {
      logger.error('alertHelpers failed:', error);
    }
  }

  /**
   * Find available helpers near the crisis location
   */
  async findMatches(crisis) {
    const radiusInKm = crisis.triage.requiresImmediate ? 30 : 15;
    const maxDistance = radiusInKm * 1000;

    const helpers = await User.find({
      role: constants.USER_ROLES.HELPER,
      isActive: true,
      'helperProfile.verificationStatus': 'verified',
      'helperProfile.isAvailable': true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: crisis.location.coordinates },
          $maxDistance: maxDistance
        }
      }
    }).limit(10);

    if (helpers.length === 0) return [];

    return helpers.map(helper => {
      const distance = this.calculateDistance(
        crisis.location.coordinates[1], crisis.location.coordinates[0],
        helper.location.coordinates[1], helper.location.coordinates[0]
      );

      let matchScore = 100;
      matchScore -= distance * 2;                    // Closer = higher score
      if (helper.location.ward === crisis.location.ward) matchScore += 20;
      if (helper.helperProfile.trustScore) matchScore += helper.helperProfile.trustScore * 2;

      return {
        helper,
        matchScore: Math.max(0, matchScore),
        distance: parseFloat(distance.toFixed(2)),
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Create a match record between a crisis and a helper
   */
  async createMatch(crisis, helper, matchData) {
    try {
      const match = new Match({
        crisisId: crisis._id,
        seekerId: crisis.seekerId,
        helperId: helper._id,
        matchScore: matchData.matchScore,
        distance: matchData.distance,
        status: constants.MATCH_STATUS.PENDING
      });
      await match.save();
      return match;
    } catch (error) {
      logger.error('Failed to create match:', error);
      return null;
    }
  }

  /**
   * Broadcast emergency crisis to all helpers within range
   */
  async broadcastEmergency(crisis) {
    const radiusInKm = 50;
    const maxDistance = radiusInKm * 1000;

    const helpers = await User.find({
      role: constants.USER_ROLES.HELPER,
      isActive: true,
      'helperProfile.verificationStatus': 'verified',
      'helperProfile.isAvailable': true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: crisis.location.coordinates },
          $maxDistance: maxDistance
        }
      }
    }).limit(20);

    for (const helper of helpers) {
      await this.createMatch(crisis, helper, { matchScore: 100, distance: 0 });
    }

    logger.info(`Emergency broadcast to ${helpers.length} helpers`);
    return helpers.length;
  }
}

module.exports = new MatchingService();
