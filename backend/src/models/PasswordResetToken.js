const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // Token expires in 1 hour
  }
}, { timestamps: true });

// Create index for faster queries
PasswordResetTokenSchema.index({ userId: 1, token: 1 });

const PasswordResetTokenModel = mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

module.exports = PasswordResetTokenModel;
