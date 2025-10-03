const mongoose = require('mongoose');

const UserLearningAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  learningResourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningResource',
    required: true,
    index: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignmentReason: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'skipped', 'expired'],
    default: 'assigned',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completionDate: {
    type: Date,
    default: null
  },
  userNotes: {
    type: String,
    default: ''
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
  feedback: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes
UserLearningAssignmentSchema.index({ userId: 1, status: 1 });
UserLearningAssignmentSchema.index({ learningResourceId: 1, status: 1 });
UserLearningAssignmentSchema.index({ assignedBy: 1, createdAt: -1 });

// Ensure unique assignment per user per resource
UserLearningAssignmentSchema.index({ userId: 1, learningResourceId: 1 }, { unique: true });

const UserLearningAssignmentModel = mongoose.model('UserLearningAssignment', UserLearningAssignmentSchema);

module.exports = UserLearningAssignmentModel;
