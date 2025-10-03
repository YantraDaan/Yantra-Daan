const mongoose = require('mongoose');

const ImpactSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  link: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Link must be a valid URL starting with http:// or https://'
    }
  },
  image: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['success_story', 'impact_metric', 'testimonial', 'achievement', 'milestone', 'other'],
    default: 'success_story',
    // index: true
  },
  location: {
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  metrics: {
    peopleHelped: {
      type: Number,
      default: 0
    },
    devicesDonated: {
      type: Number,
      default: 0
    },
    communitiesReached: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
ImpactSchema.index({ status: 1, isActive: 1 });
// ImpactSchema.index({ category: 1 });
ImpactSchema.index({ featured: 1, status: 1 });
ImpactSchema.index({ priority: -1, createdAt: -1 });
ImpactSchema.index({ tags: 1 });
ImpactSchema.index({ 'location.city': 1, 'location.state': 1 });

// Virtual for image URL
ImpactSchema.virtual('imageUrl').get(function() {
  return `/uploads/impact/${this.image.filename}`;
});

const ImpactModel = mongoose.model('Impact', ImpactSchema);

module.exports = ImpactModel;
