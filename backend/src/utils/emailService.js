const nodemailer = require('nodemailer');

// Create transporter using SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'yantradaan@gmail.com',
      pass: process.env.SMTP_PASS || 'ybzb hhke kfze otra'
    }
  });
};

// Send email function
const sendEmail = async (emailData) => {
  try {
    console.log('Attempting to send email to:', emailData.to);
    console.log('Email subject:', emailData.subject);
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailData.from || process.env.SMTP_USER || 'yantradaan@gmail.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  // New device post notification to admin
  newDevicePost: (device, donor) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🆕 New Device Post - YantraDaan</h2>
      <p>A new device has been posted and requires admin approval.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Device Details:</h3>
        <p><strong>Title:</strong> ${device.title}</p>
        <p><strong>Type:</strong> ${device.deviceType}</p>
        <p><strong>Condition:</strong> ${device.condition}</p>
        <p><strong>Description:</strong> ${device.description}</p>
        <p><strong>Location:</strong> ${device.location?.city}, ${device.location?.state}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Donor Information:</h3>
        <p><strong>Name:</strong> ${donor.name}</p>
        <p><strong>Email:</strong> ${donor.email}</p>
        <p><strong>Contact:</strong> ${donor.contact}</p>
        <p><strong>Address:</strong> ${donor.address}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Please review this device post in the admin panel and approve or reject it.
      </p>
    </div>
  `,

  // Device post approved notification to donor
  devicePostApproved: (device) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">✅ Device Post Approved - YantraDaan</h2>
      <p>Great news! Your device post has been approved by admin.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Device Details:</h3>
        <p><strong>Title:</strong> ${device.title}</p>
        <p><strong>Type:</strong> ${device.deviceType}</p>
        <p><strong>Condition:</strong> ${device.condition}</p>
        <p><strong>Description:</strong> ${device.description}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Your device is now visible to students who can request it. You'll be notified when someone requests your device.
      </p>
    </div>
  `,

  // Device post rejected notification to donor
  devicePostRejected: (device, reason) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">❌ Device Post Rejected - YantraDaan</h2>
      <p>Your device post has been reviewed but was not approved.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #991b1b;">Device Details:</h3>
        <p><strong>Title:</strong> ${device.title}</p>
        <p><strong>Type:</strong> ${device.deviceType}</p>
        <p><strong>Condition:</strong> ${device.condition}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Reason for Rejection:</h3>
        <p>${reason}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        You can modify your post and submit it again, or contact support if you have questions.
      </p>
    </div>
  `,

  // Request approved notification to requester
  requestApproved: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">✅ Device Request Approved - YantraDaan</h2>
      <p>Great news! Your request for a device has been approved.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Device Details:</h3>
        <p><strong>Title:</strong> ${request.deviceInfo.title}</p>
        <p><strong>Type:</strong> ${request.deviceInfo.deviceType}</p>
        <p><strong>Condition:</strong> ${request.deviceInfo.condition}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Admin Notes:</h3>
        <p>${request.adminNotes || 'No additional notes provided.'}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        The device owner will contact you to arrange pickup/delivery.
      </p>
    </div>
  `,

  // Request rejected notification to requester
  requestRejected: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">❌ Device Request Rejected - YantraDaan</h2>
      <p>Your request for a device has been reviewed but was not approved.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #991b1b;">Device Details:</h3>
        <p><strong>Title:</strong> ${request.deviceInfo.title}</p>
        <p><strong>Type:</strong> ${request.deviceInfo.deviceType}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Reason for Rejection:</h3>
        <p>${request.rejectionReason}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        You can browse other available devices or contact support if you have questions.
      </p>
    </div>
  `,

  // Request approved notification to device owner
  requestApprovedToOwner: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">📱 Device Request Approved - Contact Requester - YantraDaan</h2>
      <p>A request for your device has been approved by admin. Please contact the requester.</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Requester Information:</h3>
        <p><strong>Name:</strong> ${request.requesterInfo.name}</p>
        <p><strong>Email:</strong> ${request.requesterInfo.email}</p>
        <p><strong>Contact:</strong> ${request.requesterInfo.contact}</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Request Message:</h3>
        <p>${request.message}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Please coordinate with the requester to arrange pickup/delivery of your device.
      </p>
    </div>
  `,

  // Test email template
  testEmail: () => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🧪 Test Email - YantraDaan</h2>
      <p>This is a test email to verify that the email service is working correctly.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Email Service Status:</h3>
        <p><strong>Status:</strong> ✅ Active</p>
        <p><strong>SMTP Host:</strong> smtp.gmail.com</p>
        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        If you received this email, the email service is working correctly!
      </p>
    </div>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};
