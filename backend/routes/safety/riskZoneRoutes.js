const express = require('express');
const router = express.Router();
const RiskZone = require('../../models/safety/RiskZone');
const { protect } = require('../../middleware/auth/auth');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

router.use(protect);

router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5 } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Coordinates required' });
  }
  
  const zones = await RiskZone.find({
    active: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radius * 1000
      }
    }
  }).select('name type riskLevel description safetyTips');
  
  res.json({ zones, count: zones.length });
}));

module.exports = router;
