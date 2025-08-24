const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessageModel = require('../models/ContactMessage');
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

// Create contact message (public)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, subject, message } = req.body;
    
    const contactMessage = await ContactMessageModel.create({
      name,
      subject,
      message,
      status: 'new'
    });

    res.status(201).json({
      message: 'Contact message sent successfully',
      contactMessage: {
        id: contactMessage._id,
        name: contactMessage.name,
        subject: contactMessage.subject,
        message: contactMessage.message,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

// Get all contact messages (admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const messages = await ContactMessageModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ContactMessageModel.countDocuments(filter);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Failed to get contact messages' });
  }
});

// Get contact message by ID (admin only)
router.get('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const message = await ContactMessageModel.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({ message });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ error: 'Failed to get contact message' });
  }
});

// Update contact message status (admin only)
router.put('/:id/status', auth, requireRole(['admin']), [
  body('status').isIn(['new', 'read', 'archived']).withMessage('Invalid status'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { status } = req.body;
    
    const message = await ContactMessageModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({
      message: 'Status updated successfully',
      contactMessage: message
    });
  } catch (error) {
    console.error('Update contact message status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete contact message (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const message = await ContactMessageModel.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
});

module.exports = router;
