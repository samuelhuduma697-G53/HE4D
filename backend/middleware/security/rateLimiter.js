/**
 * Rate Limiter Middleware
 * IP-based rate limiting using memory store
 */

const rateLimit = require('express-rate-limit');
const logger = require('../../config/logger');

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests', message: 'Please slow down your requests' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts', message: 'Please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || req.ip
});

const crisisLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: 'Too many crisis submissions', message: 'Please wait before submitting another crisis' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

const adminApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests', message: 'Admin rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.admin?.id || req.ip
});

const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many admin login attempts', message: 'Please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || req.ip
});

module.exports = {
  apiLimiter,
  authLimiter,
  crisisLimiter,
  adminApiLimiter,
  adminAuthLimiter
};
