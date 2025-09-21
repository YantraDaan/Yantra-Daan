const mongoose = require('mongoose');

const DeviceRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: [true, 'Request message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
    index: true
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  completedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for requester info
DeviceRequestSchema.virtual('requesterInfo', {
  ref: 'User',
  localField: 'requesterId',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email phone'
});

// Virtual for device info
DeviceRequestSchema.virtual('deviceInfo', {
  ref: 'Device',
  localField: 'deviceId',
  foreignField: '_id',
  justOne: true,
  select: 'title description deviceType condition ownerId'
});

// Indexes for better performance
DeviceRequestSchema.index({ status: 1, createdAt: -1 });
DeviceRequestSchema.index({ requesterId: 1, status: 1 });
DeviceRequestSchema.index({ deviceId: 1, status: 1 });
DeviceRequestSchema.index({ requesterId: 1, deviceId: 1 }, { unique: true });

// Pre-save middleware
DeviceRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'approved') {
      this.approvedAt = new Date();
    } else if (this.status === 'completed') {
      this.completedAt = new Date();
    }
  }
  next();
});

const DeviceRequestModel = mongoose.models.DeviceRequest || mongoose.model('DeviceRequest', DeviceRequestSchema);

module.exports = DeviceRequestModel;
