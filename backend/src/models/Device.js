const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Device title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Device description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  deviceType: {
    type: String,
    required: [true, 'Device type is required'],
    enum: {
      values: ['laptop', 'desktop', 'tablet', 'smartphone', 'accessories', 'other'],
      message: 'Device type must be one of: laptop, desktop, tablet, smartphone, accessories, other'
    }
  },
  condition: {
    type: String,
    required: [true, 'Device condition is required'],
    enum: {
      values: ['excellent', 'good', 'fair', 'poor', 'old', 'new', 'used'],
      message: 'Device condition must be one of: excellent, good, fair, poor, old, new, used'
    }
  },
  location: {
    city: {
      type: String,
      required: false,
      trim: true
    },
    state: {
      type: String,
      required: false,
      trim: true
    },
    country: {
      type: String,
      required: false,
      trim: true
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: false,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      required: false,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String
  }],
  // New field for device photos
  devicePhotos: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
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
  suspensionReason: String,
  suspendedAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full location
DeviceSchema.virtual('fullLocation').get(function() {
  return `${this.location.city}, ${this.location.state}, ${this.location.country}`;
});

// Virtual for device owner info
DeviceSchema.virtual('ownerInfo', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
  select: 'name email contact userRole categoryType isOrganization about profession address linkedIn instagram facebook profilePhoto'
});

// Indexes for better performance
DeviceSchema.index({ status: 1, createdAt: -1 });
DeviceSchema.index({ deviceType: 1, condition: 1 });
DeviceSchema.index({ 'location.city': 1, 'location.state': 1 });
DeviceSchema.index({ ownerId: 1, status: 1 });

// Pre-save middleware
DeviceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'approved') {
    this.approvedAt = new Date();
  }
  next();
});

const DeviceModel = mongoose.models.Device || mongoose.model('Device', DeviceSchema);

module.exports = DeviceModel;
