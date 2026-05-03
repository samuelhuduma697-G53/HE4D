/**
 * Validation Middleware - Huduma Ecosystem
 * Request body validation using express-validator
 */

const { body, validationResult } = require('express-validator');

const validators = {
  registerSeeker: [
    body('name').trim().isLength({ min: 2 }).withMessage('Full name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').matches(/^\+254[0-9]{9}$/).withMessage('Use format: +254XXXXXXXXX'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters')
  ],

  registerHelper: [
    body('name').trim().isLength({ min: 2 }).withMessage('Full name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').matches(/^\+254[0-9]{9}$/).withMessage('Use format: +254XXXXXXXXX'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters'),
    body('nationalId').matches(/^[0-9]{7,8}$/).withMessage('Enter a valid Kenyan ID')
  ],

  userLogin: [
    body('emailOrPhone').notEmpty().withMessage('Identification required'),
    body('password').notEmpty().withMessage('Password required')
  ],

  submitCrisis: [
    body('text').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
  ],

  adminLogin: [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ]
};

const validate = (validations) => {
  return async (req, res, next) => {
    if (!validations || !Array.isArray(validations)) {
      return next();
    }
    
    try {
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = validationResult(req);
      
      if (errors.isEmpty()) {
        return next();
      }
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path || err.param, message: err.msg }))
      });
    } catch (err) {
      console.error('Validation error:', err);
      return res.status(500).json({ error: 'Internal validation error' });
    }
  };
};

module.exports = { validators, validate };
