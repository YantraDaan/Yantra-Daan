const nodemailer = require('nodemailer');
// Removed incorrect import statements that don't work in Node.js backend

// Create transporter using SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
     auth: {
      user: process.env.SMTP_USER || 'yantradaan@gmail.com',
      pass: process.env.SMTP_PASS || 'lksf rzgv wkgb nixd'
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
      html: emailData.html,
      ...(emailData.replyTo && { replyTo: emailData.replyTo })
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
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>

  <h2>New Donor Joined - Yantra Daan</h2>
  <p>A new donor has joined our community and is ready to help bridge the digital divide!</p>

  <div style="padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
    <h3>New Donor Details:</h3>
    <p><strong>Name:</strong> ${newUser.name}</p>
    <p><strong>Email:</strong> ${newUser.email}</p>
    <p><strong>Contact:</strong> ${newUser.contact}</p>
    <p><strong>Location:</strong> ${newUser.address}</p>
    <p><strong>Account Type:</strong> ${newUser.isOrganization ? 'Organization' : 'Individual'}</p>
    ${newUser.profession ? `<p><strong>Profession:</strong> ${newUser.profession}</p>` : ''}
  </div>

  <div style="padding: 20px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
    <h3>About the New Donor:</h3>
    <p>${newUser.about}</p>
  </div>

  <p style="font-size: 14px; margin-top: 30px;">
    This new donor is now part of our community and may be posting devices soon. Keep an eye out for new donation opportunities!
  </p>

  <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>

</div>
  `,

  // Device post approved notification to donor
  devicePostApproved: (device) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Device Details:</h3>
        <p><strong>Title:</strong> ${device.title}</p>
        <p><strong>Type:</strong> ${device.deviceType}</p>
        <p><strong>Condition:</strong> ${device.condition}</p>
        <p><strong>Description:</strong> ${device.description}</p>
      </div>
      
  <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Device post suspended notification to donor
  devicePostSuspended: (device, reason) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #f59e0b;">⚠️ Device Post Suspended - Yantra Daan</h2>
      <p>Your device post has been temporarily suspended and is not visible to requesters.</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Device Details:</h3>
        <p><strong>Title:</strong> ${device.title}</p>
        <p><strong>Type:</strong> ${device.deviceType}</p>
        <p><strong>Condition:</strong> ${device.condition}</p>
      </div>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #991b1b;">Reason for Suspension:</h3>
        <p>${reason}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        You can contact support to resolve the issue, or edit your post to address the concerns and request reinstatement.
      </p>
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Request approved notification to requester
  requestApproved: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #059669;">✅ Device Request Approved - Yantra Daan</h2>
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
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Request rejected notification to requester
  requestRejected: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #dc2626;">❌ Device Request Rejected - Yantra Daan</h2>
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
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Request approved notification to device owner
  requestApprovedToOwner: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #059669;">📱 Device Request Approved - Contact Requester - Yantra Daan</h2>
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
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Donation created notification to donor
  donationCreatedToDonor: (donation) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #059669;">🎉 Donation Created Successfully - Yantra Daan</h2>
      <p>Thank you for your generous donation! Your contribution has been recorded.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Donation Details:</h3>
        <p><strong>Type:</strong> ${donation.type}</p>
        ${donation.type === 'cash' ? `<p><strong>Amount:</strong> ₹${donation.amount}</p>` : ''}
        ${donation.type === 'goods' && donation.items ? `
          <p><strong>Items:</strong></p>
          <ul>
            ${donation.items.map(item => `<li>${item.name} (${item.quantity} ${item.unit || 'units'})</li>`).join('')}
          </ul>
        ` : ''}
        ${donation.message ? `<p><strong>Message:</strong> ${donation.message}</p>` : ''}
        <p><strong>Status:</strong> ${donation.status}</p>
      </div>
      
      ${donation.request ? `
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e;">Request Details:</h3>
          <p><strong>Title:</strong> ${donation.request.title}</p>
          <p><strong>Description:</strong> ${donation.request.description}</p>
        </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Your donation is now being processed. You'll be notified when it's completed.
      </p>
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Donation created notification to requester
  donationCreatedToRequester: (donation, requester) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #059669;">🎉 New Donation Received - Yantra Daan</h2>
      <p>Great news! Someone has made a donation towards your request.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Donation Details:</h3>
        <p><strong>Type:</strong> ${donation.type}</p>
        ${donation.type === 'cash' ? `<p><strong>Amount:</strong> ₹${donation.amount}</p>` : ''}
        ${donation.type === 'goods' && donation.items ? `
          <p><strong>Items:</strong></p>
          <ul>
            ${donation.items.map(item => `<li>${item.name} (${item.quantity} ${item.unit || 'units'})</li>`).join('')}
          </ul>
        ` : ''}
        ${donation.message ? `<p><strong>Message:</strong> ${donation.message}</p>` : ''}
        <p><strong>Status:</strong> ${donation.status}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Your Request:</h3>
        <p><strong>Title:</strong> ${donation.request.title}</p>
        <p><strong>Description:</strong> ${donation.request.description}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Thank you for using Yantra Daan. We'll keep you updated on the progress of your request.
      </p>
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // New user created notification to donor
  newUserCreatedToDonor: (newUser) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
       <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
        <h3 style="color: #000000;">New Donor Details:</h3>
        <p><strong>Name:</strong> ${newUser.name}</p>
        <p><strong>Email:</strong> ${newUser.email}</p>
        <p><strong>Contact:</strong> ${newUser.contact}</p>
        <p><strong>Location:</strong> ${newUser.address}</p>
        <p><strong>Account Type:</strong> ${newUser.isOrganization ? 'Organization' : 'Individual'}</p>
        ${newUser.profession ? `<p><strong>Profession:</strong> ${newUser.profession}</p>` : ''}
        <p>${newUser.about}</p>
            
   <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // New user created notification to requester
  newUserCreatedToRequester: (newUser) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #059669;">👋 New Requester Joined - Yantra Daan</h2>
      <p>A new requester has joined our community and is looking for devices to help with their needs!</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">New Requester Details:</h3>
        <p><strong>Name:</strong> ${newUser.name}</p>
        <p><strong>Email:</strong> ${newUser.email}</p>
        <p><strong>Contact:</strong> ${newUser.contact}</p>
        <p><strong>Location:</strong> ${newUser.address}</p>
        <p><strong>Account Type:</strong> ${newUser.isOrganization ? 'Organization' : 'Individual'}</p>
        ${newUser.profession ? `<p><strong>Profession:</strong> ${newUser.profession}</p>` : ''}
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">About the New Requester:</h3>
        <p>${newUser.about}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        This new requester is now part of our community and may be looking for devices. If you have devices to donate, consider reaching out!
      </p>
    <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,

  // Password setup invitation
  passwordSetup: (user, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
      <h2 style="color: #059669;">🔐 Set Up Your Password - Yantra Daan</h2>
      <p>Hello ${user.name},</p>
      <p>Welcome to Yantra Daan! Your account has been created successfully. To complete your registration and access your account, please set up your password.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Account Details:</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.userRole === 'donor' ? 'Device Donor' : 'Device Requester'}</p>
        <p><strong>Account Type:</strong> ${user.isOrganization ? 'Organization' : 'Individual'}</p>
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Next Steps:</h3>
        <p>1. Click the button below to set up your password</p>
        <p>2. Choose a strong password with at least 8 characters</p>
        <p>3. Include uppercase, lowercase, numbers, and special characters</p>
        <p>4. Once set, you'll be automatically logged in</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-password?email=${encodeURIComponent(user.email)}&token=${token}" 
           style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Set Up Password
        </a>
      </div>
      
      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">
          <strong>Security Note:</strong> This link will expire in 24 hours for your security. If you don't set up your password within this time, you'll need to request a new password setup link.
        </p>
      </div>
      
  <div style="text-align: center; margin-top: 20px;">
    <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
         style="max-width: 100%; height: auto;" />
  </div>
    </div>
  `,
};

// Helper functions for sending specific email notifications
const notifyDonationCreated = async (donation, donor, requester) => {
  try {
    // Send email to donor
    const donorEmailData = {
      to: donor.email,
      subject: 'Donation Created Successfully - Yantra Daan',
      html: emailTemplates.donationCreatedToDonor(donation)
    };
    
    await sendEmail(donorEmailData);
    console.log('Donation created notification sent to donor:', donor.email);
    
    // Send email to requester (if donation is linked to a request)
    if (requester) {
      const requesterEmailData = {
        to: requester.email,
        subject: 'New Donation Received - Yantra Daan',
        html: emailTemplates.donationCreatedToRequester(donation, requester)
      };
      
      await sendEmail(requesterEmailData);
      console.log('Donation created notification sent to requester:', requester.email);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending donation created notifications:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to notify all donors and requesters when a new user is created
const notifyNewUserCreated = async (newUser) => {
  try {
    const UserModel = require('../models/UserModels');
    
    // Get all existing donors and requesters
    const existingUsers = await UserModel.find({
      userRole: { $in: ['donor', 'requester'] },
      emailUpdates: true,
      isActive: true
    });

    const notificationPromises = [];

    // Send notification to all donors
    const donors = existingUsers.filter(user => user.userRole === 'donor');
    for (const donor of donors) {
      const donorEmailData = {
        to: donor.email,
        subject: 'New User Joined - Yantra Daan',
        html: emailTemplates.newUserCreatedToDonor(newUser)
      };
      notificationPromises.push(sendEmail(donorEmailData));
    }

    // Send notification to all requesters
    const requesters = existingUsers.filter(user => user.userRole === 'requester');
    for (const requester of requesters) {
      const requesterEmailData = {
        to: requester.email,
        subject: 'New User Joined - Yantra Daan',
        html: emailTemplates.newUserCreatedToRequester(newUser)
      };
      notificationPromises.push(sendEmail(requesterEmailData));
    }

    // Send all notifications in parallel
    const results = await Promise.allSettled(notificationPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`New user notification sent: ${successful} successful, ${failed} failed`);
    console.log(`Notified ${donors.length} donors and ${requesters.length} requesters about new user: ${newUser.name}`);
    
    return { 
      success: true, 
      notified: { donors: donors.length, requesters: requesters.length },
      results: { successful, failed }
    };
  } catch (error) {
    console.error('Error sending new user notifications:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  notifyDonationCreated,
  notifyNewUserCreated

};
