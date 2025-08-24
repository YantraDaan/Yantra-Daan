const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Founder & CEO', 'Operations Director', 'Community Manager', 'Technical Lead', 'Support Staff']
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
teamMemberSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
teamMemberSchema.index({ email: 1 });
teamMemberSchema.index({ role: 1 });
teamMemberSchema.index({ status: 1 });
teamMemberSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
