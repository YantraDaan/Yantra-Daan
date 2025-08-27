const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const DonationModel = require('../models/Donation');
const { auth, requireRole } = require('../middleware/auth');

const router = Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};
// Create donation (authenticated users)
router.post('/', auth, [
  body('type').isIn(['cash', 'goods', 'service']).withMessage('Type must be cash, goods, or service'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('message').optional().trim(),
  body('request').optional().isMongoId().withMessage('Invalid request ID'),
  handleValidationErrors
], async (req, res) => {
  console.log('POST /donations route hit - creating donation');
  try {
    const { type, amount, items, message, request: requestId } = req.body;
    
    // Validate items for goods type
    if (type === 'goods' && (!items || !Array.isArray(items) || items.length === 0)) {
      return res.status(400).json({ error: 'Items are required for goods donations' });
    }

    const donation = await DonationModel.create({
      donor: req.user._id,
      recipient: req.body.recipient,
      request: requestId,
      type,
      amount: type === 'cash' ? (amount || 0) : undefined,
      items: type === 'goods' ? items : undefined,
      message,
      status: 'pledged'
    });

    await donation.populate('donor', 'name email');
    if (requestId) await donation.populate('request', 'title description');

    res.status(201).json({
      message: 'Donation created successfully',
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Get all donations (with optional filtering)
router.get('/', async (req, res) => {
  console.log('GET /donations route hit - getting all donations');
  try {
    const { page = 1, limit = 20, type, status, donorId, requestId } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (donorId) filter.donor = donorId;
    if (requestId) filter.request = requestId;

    const donations = await DonationModel.find(filter)
      .populate('donor', 'name email')
      .populate('recipient', 'name email')
      .populate('request', 'title description')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DonationModel.countDocuments(filter);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to get donations' });
  }
});

// Get recent donations (for admin dashboard)
router.get('/recent', auth, requireRole(['admin']), async (req, res) => {
  console.log('GET /donations/recent route hit - getting recent donations');
  try {
    const { limit = 5 } = req.query;
    
    const donations = await DonationModel.find({})
      .populate('donor', 'name email')
      .populate('recipient', 'name email')
      .populate('request', 'title description')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      donations,
      total: donations.length
    });
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({ error: 'Failed to get recent donations' });
  }
});

// Get pending donations (for admin dashboard)
router.get('/pending', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const donations = await DonationModel.find({ status: 'pledged' })
      .populate('donor', 'name email')
      .populate('recipient', 'name email')
      .populate('request', 'title description')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      donations,
      total: donations.length
    });
  } catch (error) {
    console.error('Get pending donations error:', error);
    res.status(500).json({ error: 'Failed to get pending donations' });
  }
});

// Get donation statistics (for admin dashboard)
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const stats = await DonationModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const statusStats = await DonationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDonations = await DonationModel.countDocuments();
    const totalAmount = await DonationModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      total: totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      byType: stats,
      byStatus: statusStats
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Failed to get donation statistics' });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const donation = await DonationModel.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('recipient', 'name email')
      .populate('request', 'title description');
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ donation });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ error: 'Failed to get donation' });
  }
});

// Get user's own donations
router.get('/my/donations', auth, async (req, res) => {
  try {
    const donations = await DonationModel.find({ donor: req.user._id })
      .populate('recipient', 'name email')
      .populate('request', 'title description')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({ error: 'Failed to get your donations' });
  }
});

// Update user's own donation
router.put('/:id', auth, [
  body('message').optional().trim(),
  body('status').optional().isIn(['pledged', 'completed', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const donation = await DonationModel.findOne({
      _id: req.params.id,
      donor: req.user._id
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found or not owned by you' });
    }

    // Only allow updates if donation is still pledged
    if (donation.status !== 'pledged') {
      return res.status(400).json({ error: 'Cannot update donation that is not pledged' });
    }

    const updates = {};
    if (req.body.message !== undefined) updates.message = req.body.message;
    if (req.body.status !== undefined) updates.status = req.body.status;

    const updatedDonation = await DonationModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('donor', 'name email');

    res.json({
      message: 'Donation updated successfully',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ error: 'Failed to update donation' });
  }
});

// Delete user's own donation
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await DonationModel.findOneAndDelete({
      _id: req.params.id,
      donor: req.user._id
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found or not owned by you' });
    }

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ error: 'Failed to delete donation' });
  }
});

// Admin: Update donation status
router.put('/admin/:id/status', auth, requireRole(['admin']), [
  body('status').isIn(['pledged', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('transactionId').optional().trim(),
  body('paymentProvider').optional().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { status, transactionId, paymentProvider } = req.body;
    
    const updates = { status };
    if (transactionId !== undefined) updates.transactionId = transactionId;
    if (paymentProvider !== undefined) updates.paymentProvider = paymentProvider;

    const donation = await DonationModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('donor', 'name email');

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({
      message: 'Donation status updated successfully',
      donation
    });
  } catch (error) {
    console.error('Admin update donation status error:', error);
    res.status(500).json({ error: 'Failed to update donation status' });
  }
});

// Get donation statistics (admin only)
router.get('/admin/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await DonationModel.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const statusStats = await DonationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDonations = await DonationModel.countDocuments();
    const totalAmount = await DonationModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      total: totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      byType: stats,
      byStatus: statusStats
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: 'Failed to get donation statistics' });
  }
});

module.exports = router;


