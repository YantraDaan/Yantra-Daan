const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'design', 'business', 'language', 'academic', 'technical', 'soft_skills', 'other'],
    index: true
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    index: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['course', 'tutorial', 'book', 'video', 'article', 'podcast', 'workshop', 'certification'],
    index: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String, // e.g., "2 hours", "4 weeks", "Self-paced"
    default: 'Self-paced'
  },
  cost: {
    type: String,
    enum: ['free', 'paid', 'freemium'],
    default: 'free'
  },
  language: {
    type: String,
    default: 'English'
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['students', 'professionals', 'beginners', 'experts', 'all'],
    default: 'all'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
// LearningResourceSchema.index({ category: 1, level: 1 });
// LearningResourceSchema.index({ resourceType: 1 });
LearningResourceSchema.index({ status: 1, isActive: 1 });
LearningResourceSchema.index({ tags: 1 });
LearningResourceSchema.index({ skills: 1 });

const LearningResourceModel = mongoose.model('LearningResource', LearningResourceSchema);

module.exports = LearningResourceModel;
