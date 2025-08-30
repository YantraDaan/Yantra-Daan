const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: [/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces']
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    contact: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Contact must be a valid 10 digit number']
    },
    userRole: {
      type: String,
      enum: ['requester', 'donor', 'admin'], 
      required: true,
      index: true
    },
    categoryType: {
      type: String,
      enum: ['individual', 'organization'],
      required: true
    },
    isOrganization: {
      type: Boolean,
      default: false
    },
    about: {
      type: String,
      required: true,
    },
    profession: {
      type: String,
      required: true,
    },
    linkedIn: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    facebook: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    emailUpdates: {
      type: Boolean,
      default: true,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    document: {
      filename: {
        type: String,
        default: ''
      },
      originalName: {
        type: String,
        default: ''
      },
      mimetype: {
        type: String,
        default: ''
      },
      size: {
        type: Number,
        default: 0
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    profilePhoto: {
      filename: {
        type: String,
        default: ''
      },
      originalName: {
        type: String,
        default: ''
      },
      mimetype: {
        type: String,
        default: ''
      },
      size: {
        type: Number,
        default: 0
      },
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = UserModel;
