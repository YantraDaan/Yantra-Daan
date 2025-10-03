const { Router } = require('express');
const ContactMessageModel = require('../models/ContactMessage');
// Import the email service
const { sendEmail } = require('../utils/emailService');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, organization, subject, message, contactType } = req.body;
    
    const created = await ContactMessageModel.create({
      name,
      email,
      phone,
      organization,
      subject,
      message,
      contactType // Save the contact type
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

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit message', details: String(error) });
  }
});

router.get('/', async (_req, res) => {
  const messages = await ContactMessageModel.find().sort({ createdAt: -1 });
  res.json(messages);
});

module.exports = router;