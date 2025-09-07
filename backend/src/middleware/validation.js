const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('userRole')
    .optional()
    .isIn(['requester', 'donor', 'admin'])
    .withMessage('User role must be one of: requester, donor, admin'),
  
  body('contact')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid contact number'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('userRole')
    .optional()
    .isIn(['requester', 'donor', 'admin'])
    .withMessage('User role must be one of: requester, donor, admin'),
  
  handleValidationErrors
];

// Admin login validation (no userRole required)
const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  handleValidationErrors
];

// New password validation
const validateNewPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

// Device post validation
const validateDevicePost = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Device title must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Device description must be between 10 and 2000 characters'),
  
  body('deviceType')
    .isIn(['laptop', 'desktop', 'tablet', 'smartphone', 'accessories', 'other'])
    .withMessage('Device type must be one of: laptop, desktop, tablet, smartphone, accessories, other'),
  
  body('condition')
    .isIn(['excellent', 'good', 'fair', 'poor', 'old', 'new', 'used'])
    .withMessage('Device condition must be one of: excellent, good, fair, poor, old, new, used'),
  
  body('location.city')
    .optional()
    .if(body('location.city').exists())
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),
  
  body('location.state')
    .optional()
    .if(body('location.state').exists())
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name cannot exceed 100 characters'),
  
  body('location.country')
    .optional()
    .if(body('location.country').exists())
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country name cannot exceed 100 characters'),
  
  body('contactInfo.phone')
    .optional()
    .if(body('contactInfo.phone').exists())
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('contactInfo.email')
    .optional()
    .if(body('contactInfo.email').exists())
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*.url')
    .optional()
    .if(body('images.*.url').exists())
    .custom((value) => {
      // Accept both full URLs and relative paths
      if (typeof value === 'string' && value.trim() !== '') {
        // Check if it's a valid URL or a relative path
        const isUrl = /^https?:\/\/.+/.test(value);
        const isRelativePath = /^[^\/]+\/[^\/]+/.test(value);
        
        if (!isUrl && !isRelativePath) {
          throw new Error('Image URL must be a valid URL or relative path');
        }
      }
      return true;
    })
    .withMessage('Image URL must be a valid URL or relative path'),
  
  body('images.*.caption')
    .optional()
    .if(body('images.*.caption').exists())
    .isLength({ max: 200 })
    .withMessage('Image caption cannot exceed 200 characters'),
  
  // New field for device photos
  body('devicePhotos')
    .optional()
    .isArray()
    .withMessage('Device photos must be an array'),
  
  body('devicePhotos.*.url')
    .optional()
    .if(body('devicePhotos.*.url').exists())
    .custom((value) => {
      // Accept both full URLs and relative paths
      if (typeof value === 'string' && value.trim() !== '') {
        // Check if it's a valid URL or a relative path
        const isUrl = /^https?:\/\/.+/.test(value);
        const isRelativePath = /^[^\/]+\/[^\/]+/.test(value);
        
        if (!isUrl && !isRelativePath) {
          throw new Error('Device photo URL must be a valid URL or relative path');
        }
      }
      return true;
    })
    .withMessage('Device photo URL must be a valid URL or relative path'),
  
  body('devicePhotos.*.caption')
    .optional()
    .if(body('devicePhotos.*.caption').exists())
    .isLength({ max: 200 })
    .withMessage('Device photo caption cannot exceed 200 characters'),
  
  handleValidationErrors
];

// Device request validation
const validateDeviceRequest = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Request message must be between 10 and 500 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateAdminLogin,
  validatePasswordReset,
  validateNewPassword,
  validateDevicePost,
  validateDeviceRequest
};
