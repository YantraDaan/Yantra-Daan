const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // email: { type: String, required: true, lowercase: true, trim: true, index: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new', index: true }
  },
  { timestamps: true }
);

const ContactMessageModel =
  mongoose.models.ContactMessage ||
  mongoose.model('ContactMessage', ContactMessageSchema);

module.exports = ContactMessageModel;


