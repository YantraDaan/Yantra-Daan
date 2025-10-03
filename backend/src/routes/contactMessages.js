const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const ContactMessageModel = require('../models/ContactMessage');
const { auth, requireRole } = require('../middleware/auth');
// Import the email service
const { sendEmail } = require('../utils/emailService');

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
    const { name, subject, message, email, phone, organization, contactType } = req.body;
    
    const contactMessage = await ContactMessageModel.create({
      name,
      subject,
      message,
      email,
      phone,
      organization,
      contactType, // Save the contact type
      status: 'new'
    });

    // Send email notification to admin (yantradaan@gmail.com)
    try {
      const adminEmail = 'yantradaan@gmail.com';
      
      // Map contact type to readable text
      const contactTypeMap = {
        'donation': 'Donating Devices',
        'request': 'Requesting Device',
        'volunteer': 'Volunteering',
        'general': 'General Inquiry'
      };
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Contact Form Submission - Yantra Daan</h2>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ''}
            ${contactType ? `<p><strong>Interested In:</strong> ${contactTypeMap[contactType] || contactType}</p>` : ''}
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e;">Message:</h3>
            <p>${message}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This message was submitted through the contact form on Yantra Daan website.
          </p>
        </div>
      `;
      
      await sendEmail({
        to: adminEmail,
        subject: `New Contact Form Submission${subject ? `: ${subject}` : ''}`,
        html: emailHtml
      });
      
      console.log('Contact form notification email sent to admin:', adminEmail);
    } catch (emailError) {
      console.error('Failed to send contact form notification email:', emailError);
      // Don't fail the request if email sending fails, just log the error
    }

    res.status(201).json({
      message: 'Contact message sent successfully',
      contactMessage: {
        id: contactMessage._id,
        name: contactMessage.name,
        subject: contactMessage.subject,
        message: contactMessage.message,
        contactType: contactMessage.contactType,
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
