const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/status', (req, res) => {
  res.status(200).json({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date(),
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

module.exports = router;