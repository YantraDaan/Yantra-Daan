const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    organization: { type: String, trim: true },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    contactType: { type: String, trim: true }, // Add contactType field
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new', index: true }
  },
  { timestamps: true }
);

const ContactMessageModel =
  mongoose.models.ContactMessage ||
  mongoose.model('ContactMessage', ContactMessageSchema);

module.exports = ContactMessageModel;