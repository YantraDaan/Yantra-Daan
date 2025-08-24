const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, index: true },
    amountNeeded: { type: Number, min: 0 },
    amountFunded: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['open', 'funding', 'funded', 'closed'], default: 'open', index: true },
    attachments: { type: [String], default: undefined },
    deadline: { type: Date }
  },
  { timestamps: true }
);

const RequestModel =
  mongoose.models.Request || mongoose.model('Request', RequestSchema);

module.exports = RequestModel;


