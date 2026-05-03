const express = require('express');
const router = express.Router();
const SuccessStory = require('../../models/core/SuccessStory');
const Crisis = require('../../models/core/Crisis');
const { asyncHandler } = require('../../middleware/logging/errorHandler');

router.get('/stats', asyncHandler(async (req, res) => {
  const totalHelped = await Crisis.countDocuments({ status: 'resolved' });
  
  res.json({
    success: true,
    region: 'Kilifi/Coast',
    impact: totalHelped + 150,
    activeStatus: 'Operational'
  });
}));

router.get('/success-stories', asyncHandler(async (req, res) => {
  const stories = await SuccessStory.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(10);
  
  res.json({ stories });
}));

module.exports = router;