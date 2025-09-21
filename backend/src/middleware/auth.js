const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModels');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN',
        message: 'Please provide a valid authentication token'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'yantraDaan2024SuperSecretKeyForJWTTokenGeneration';
    
    if (!jwtSecret) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        code: 'JWT_CONFIG_ERROR',
        message: 'Authentication service is not properly configured'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    if (!decoded.userId) {
      return res.status(401).json({ 
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Token does not contain valid user information'
      });
    }

    const user = await UserModel.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
        message: 'The provided token is not valid'
      });
    }

    // If user is deactivated, treat token as invalid
    if (user.isActive === false) {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
        message: 'The provided token is not valid'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN',
        message: 'The provided token is not valid'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.',
        code: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please login again'
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        code: 'INVALID_USER_ID',
        message: 'The user ID in the token is not valid'
      });
    }
    
    res.status(500).json({ 
      error: 'Token verification failed.',
      code: 'AUTH_ERROR',
      message: 'An error occurred while verifying your authentication'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Check if user has userRole field (your schema uses userRole)
    const userRole = req.user.userRole || req.user.role;
    
    if (!userRole) {
      return res.status(403).json({ 
        error: 'User role not defined.',
        code: 'NO_ROLE',
        message: 'User account does not have a defined role'
      });
    }
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${userRole}`,
        requiredRoles: roles,
        userRole: userRole
      });
    }
    
    next();
  };
};

// Admin role check specifically
const requireAdmin = requireRole(['admin']);

// Donor role check specifically  
const requireDonor = requireRole(['donor']);

// Requester/Student role check specifically
const requireRequester = requireRole(['requester']);

module.exports = { 
  auth, 
  requireRole, 
  requireAdmin, 
  requireDonor, 
  requireRequester 
};
