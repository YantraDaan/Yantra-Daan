const mongoose = require('mongoose');

const ItemDonationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String }
  },
  { _id: false }
);

const DonationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', index: true },
    type: { type: String, enum: ['cash', 'goods', 'service'], required: true },
    amount: { type: Number, min: 0 },
    items: { type: [ItemDonationSchema], default: undefined },
    message: { type: String },
    status: { type: String, enum: ['pledged', 'completed', 'cancelled'], default: 'pledged', index: true },
    transactionId: { type: String },
    paymentProvider: { type: String }
  },
  { timestamps: true }
);

const DonationModel =
  mongoose.models.Donation || mongoose.model('Donation', DonationSchema);

module.exports = DonationModel;


