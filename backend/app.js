const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/logging/errorHandler');
const { apiLimiter } = require('./middleware/security/rateLimiter');
const logger = require('./config/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Performance middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Health check
app.get('/api/public/health/status', (req, res) => {
  res.json({
    success: true,
    message: 'Huduma Ecosystem API is running',
    timestamp: new Date().toISOString()
  });
});

// Rate limiting
app.use('/api/', apiLimiter);

// Routes - wrapped in try/catch to prevent crashes from missing files
const safeRequire = (path) => {
  try {
    return require(path);
  } catch (err) {
    logger.warn(`Route file not found or invalid: ${path} - ${err.message}`);
    const { Router } = require('express');
    const fallback = Router();
    fallback.all('*', (req, res) => {
      res.status(503).json({ error: 'Service temporarily unavailable', path });
    });
    return fallback;
  }
};

app.use('/api/auth', safeRequire('./routes/public/authRoutes'));
app.use('/api/public', safeRequire('./routes/public/publicRoutes'));
app.use('/api/crisis', safeRequire('./routes/core/crisisRoutes'));
app.use('/api/helpers', safeRequire('./routes/core/helperRoutes'));
app.use('/api/matching', safeRequire('./routes/core/matchingRoutes'));
app.use('/api/donations', safeRequire('./routes/core/donationRoutes'));
app.use('/api/notifications', safeRequire('./routes/core/notificationRoutes'));
app.use('/api/admin/auth', safeRequire('./routes/admin/adminAuthRoutes'));
app.use('/api/admin', safeRequire('./routes/admin/adminRoutes'));
app.use('/api/admin/invite', safeRequire('./routes/admin/adminInviteRoutes'));
app.use('/api/admin/sessions', safeRequire('./routes/admin/adminSessionRoutes'));
app.use('/api/safety', safeRequire('./routes/safety/safetyRoutes'));
app.use('/api/safety/debriefing', safeRequire('./routes/safety/debriefingRoutes'));
app.use('/api/escort', safeRequire('./routes/safety/escortRoutes'));
app.use('/api/safety/peer-support', safeRequire('./routes/safety/peerSupportRoutes'));
app.use('/api/safety/risk-zones', safeRequire('./routes/safety/riskZoneRoutes'));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// Debug - verify export
console.log('✅ app.js loaded - Express app exported');
console.log('   Type:', typeof app);
console.log('   Has set:', typeof app.set === 'function');
