const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'yantraDaan2024SuperSecretKeyForJWTTokenGeneration',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate random token for password reset
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash reset token for storage
const hashResetToken = async (token) => {
  return await bcrypt.hash(token, 10);
};

// Compare reset token
const compareResetToken = async (token, hash) => {
  return await bcrypt.compare(token, hash);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  generateResetToken,
  hashResetToken,
  compareResetToken
};
