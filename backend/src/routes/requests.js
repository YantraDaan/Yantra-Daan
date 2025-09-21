const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const RequestModel = require('../models/Request');
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

// Create new request (authenticated users)
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').optional().trim(),
  body('amountNeeded').optional().isNumeric().withMessage('Amount must be a number'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { title, description, category, amountNeeded, deadline, attachments } = req.body;
    
    const request = await RequestModel.create({
      student: req.user._id,
      title,
      description,
      category,
      amountNeeded: amountNeeded || 0,
      amountFunded: 0,
      status: 'open',
      attachments: attachments || [],
      deadline: deadline ? new Date(deadline) : undefined
    });

    await request.populate('student', 'name email');

    res.status(201).json({
      message: 'Request created successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get all requests (public, with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, minAmount, maxAmount } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (minAmount || maxAmount) {
      filter.amountNeeded = {};
      if (minAmount) filter.amountNeeded.$gte = Number(minAmount);
      if (maxAmount) filter.amountNeeded.$lte = Number(maxAmount);
    }

    const requests = await RequestModel.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RequestModel.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get request by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const request = await RequestModel.findById(req.params.id)
      .populate('student', 'name email');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

// Get user's own requests
router.get('/my/requests', auth, async (req, res) => {
  try {
    const requests = await RequestModel.find({ student: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to get your requests' });
  }
});

// Update user's own request
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('category').optional().trim(),
  body('amountNeeded').optional().isNumeric().withMessage('Amount must be a number'),
  body('deadline').optional().isISO8601().withMessage('Invalid deadline format'),
  handleValidationErrors
], async (req, res) => {
  try {
    const request = await RequestModel.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not owned by you' });
    }

    // Only allow updates if request is still open
    if (request.status !== 'open') {
      return res.status(400).json({ error: 'Cannot update request that is not open' });
    }

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.amountNeeded !== undefined) updates.amountNeeded = req.body.amountNeeded;
    if (req.body.deadline !== undefined) updates.deadline = req.body.deadline;
    if (req.body.attachments !== undefined) updates.attachments = req.body.attachments;

    const updatedRequest = await RequestModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('student', 'name email');

    res.json({
      message: 'Request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Delete user's own request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await RequestModel.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not owned by you' });
    }

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Admin: Update request status
router.put('/admin/:id/status', auth, requireRole(['admin']), [
  body('status').isIn(['open', 'funding', 'funded', 'closed']).withMessage('Invalid status'),
  body('amountFunded').optional().isNumeric().withMessage('Amount funded must be a number'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { status, amountFunded } = req.body;
    
    const updates = { status };
    if (amountFunded !== undefined) updates.amountFunded = amountFunded;

    const request = await RequestModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('student', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({
      message: 'Request status updated successfully',
      request
    });
  } catch (error) {
    console.error('Admin update request status error:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// Get request statistics (admin only)
router.get('/admin/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await RequestModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountNeeded' },
          totalFunded: { $sum: '$amountFunded' }
        }
      }
    ]);

    const totalRequests = await RequestModel.countDocuments();
    const totalAmountNeeded = await RequestModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amountNeeded' } } }
    ]);
    const totalAmountFunded = await RequestModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amountFunded' } } }
    ]);

    res.json({
      total: totalRequests,
      totalAmountNeeded: totalAmountNeeded[0]?.total || 0,
      totalAmountFunded: totalAmountFunded[0]?.total || 0,
      byStatus: stats
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({ error: 'Failed to get request statistics' });
  }
});

module.exports = router;


