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
// Helper function to format date
const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
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

  // Invoice generation for approved requests
  generateInvoice: (request) => `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #059669; margin: 0;">YANTRA DAAN FOUNDATION</h1>
        <p style="color: #6b7280; margin: 5px 0;">Empowering Education Through Technology</p>
        <p style="color: #6b7280; margin: 5px 0;">Invoice #: INV-${request._id.toString().substr(0, 8).toUpperCase()}</p>
        <p style="color: #6b7280; margin: 5px 0;">Date: ${new Date(request.approvedAt).toLocaleDateString()}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div>
          <h3 style="color: #059669; margin-bottom: 10px;">From (Donor):</h3>
          <p><strong>${request.deviceInfo.ownerId.name}</strong></p>
          <p>${request.deviceInfo.ownerId.email}</p>
          <p>${request.deviceInfo.ownerId.contact || 'N/A'}</p>
        </div>
        
        <div>
          <h3 style="color: #059669; margin-bottom: 10px;">To (Requester):</h3>
          <p><strong>${request.requesterInfo.name}</strong></p>
          <p>${request.requesterInfo.email}</p>
          <p>${request.requesterInfo.contact || 'N/A'}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #059669; margin-bottom: 10px;">Device Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0fdf4;">
              <th style="text-align: left; padding: 10px; border: 1px solid #d1d5db;">Device</th>
              <th style="text-align: left; padding: 10px; border: 1px solid #d1d5db;">Type</th>
              <th style="text-align: left; padding: 10px; border: 1px solid #d1d5db;">Condition</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #d1d5db;">${request.deviceInfo.title}</td>
              <td style="padding: 10px; border: 1px solid #d1d5db;">${request.deviceInfo.deviceType}</td>
              <td style="padding: 10px; border: 1px solid #d1d5db;">${request.deviceInfo.condition}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #059669; margin-bottom: 10px;">Request Details:</h3>
        <p><strong>Request Message:</strong></p>
        <div style="background-color: #f9fafb; padding: 15px; border: 1px solid #d1d5db; border-radius: 4px;">
          ${request.message}
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #059669; margin-bottom: 10px;">Admin Notes:</h3>
        <p>${request.adminNotes || 'No additional notes provided.'}</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db;">
        <p style="color: #6b7280; margin: 0;">This is an official invoice from Yantra Daan Foundation for the device donation.</p>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Thank you for being part of our mission to bridge the digital divide.</p>
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
  
  // New user created notification to admin
  newUserCreatedToAdmin: (newUser) => `
     <div style="font-family: Arial, sans-serif; max-width: 559px; margin: 0 auto; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
  <div style="background-color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
    <img 
      src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" 
      alt="Yantra Daan Foundation Header" 
      width="519px" 
      style="max-width: 519px; height: auto;" 
    />
  </div>
  <div style="text-align: right; padding-right: 30px"><strong>${formatDate()}</strong></div>
  <div style="padding: 30px 20px;">
    <div><b>A new user has registered on the Yantra Daan platform. Please review their details.</b></div>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.name}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.email}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.contact}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.userRole}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.categoryType}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.profession}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.address}</strong>,</p>
    <br>
    <br>
    <b>About the User :-</b>
    <p>${newUser.about}</p>

    </div>
      <div style="text-align: center; margin-top: 30px;">
    <img 
      src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" 
      alt="Yantra Daan Foundation Footer" 
      width="519px" 
      style="max-width: 519px; height: auto;" 
    />
  </div>
  </div>
</div>
  `,

  // Welcome email for new donor
  welcomeNewDonor: (newUser) => `
    <div style="font-family: Arial, sans-serif; max-width: 100%; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" alt="Yantra Daan Foundation Header" width="100%"
             style="max-width: 100%; height: auto;" />
      </div>
      
      <h2 style="color: #059669;">🎉 Welcome to Yantra Daan, ${newUser.name}!</h2>
      <p>Thank you for joining our community as a device donor. Your generosity helps bridge the digital divide and empowers education.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #166534;">Your Account Details:</h3>
        <p><strong>Name:</strong> ${newUser.name}</p>
        <p><strong>Email:</strong> ${newUser.email}</p>
        <p><strong>Account Type:</strong> ${newUser.isOrganization ? 'Organization' : 'Individual'} ${newUser.userRole}</p>
        ${newUser.profession ? `<p><strong>Profession:</strong> ${newUser.profession}</p>` : ''}
      </div>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e;">Getting Started:</h3>
        <p>1. Log in to your account</p>
        <p>2. Post devices you'd like to donate</p>
        <p>3. Connect with requesters in need</p>
        <p>4. Make a positive impact in someone's life</p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        We're excited to have you as part of our mission to bridge the digital divide. If you have any questions, feel free to contact our support team.
      </p>
      
      <div style="text-align: center; margin-top: 20px;">
        <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" alt="Yantra Daan Foundation Footer" width="100%"
             style="max-width: 100%; height: auto;" />
      </div>
    </div>
  `,

  // Welcome email for new requester
  welcomeNewRequester: (newUser, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 559px; margin: 0 auto; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
  <div style="background-color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
    <img 
      src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" 
      alt="Yantra Daan Foundation Header" 
      width="519px" 
      style="max-width: 519px; height: auto;" 
    />
  </div>
  <div style="text-align: right; padding-right: 30px"><strong>${formatDate()}</strong></div>
  <div style="padding: 30px 20px;">
  
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.name}</strong>,</p>

    <p style="font-size: 15px; color: #333333;">
      We are delighted to welcome you to our platform!
    </p>

    <p style="font-size: 15px; color: #333333;">
      <strong>Yantra Daan</strong> is a platform to help young youth to get the device. 
            to begin with.
    </p>

    <p style="font-size: 15px; color: #333333; margin-top: 15px;">
      Please follow these instructions.
    </p>

    <ol style="font-size: 15px; color: #333333; margin-left: 20px;">
      <li><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-password?email=${encodeURIComponent(newUser.email)}&token=${token}" style="color: #007bff; text-decoration: none;">Set up your password</a></li>
      <li>Complete your profile (address, contact, guardian details if under 18)</li>
      <li>Share why you need a device</li>
      <li>Wait for our team to review your request</li>
    </ol>

    <p style="font-size: 15px; color: #333333;">
      Stay tuned for updates on your application.
    </p>

    <p style="font-size: 15px; color: #333333;">
      Need help? Reply to this email or contact us at 
      <a href="mailto:team@yantradaan.org" style="color: #007bff; text-decoration: none;">team@yantradaan.org</a>
      or call us at <strong>+91 87002 83813</strong>.
    </p>

    <p style="font-size: 15px; color: #333333; margin-top: 20px;">
      Sincerely,<br/>
      <strong>Team Yantra Daan</strong>
    </p>
    </div>
      <div style="text-align: center; margin-top: 30px;">
    <img 
      src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" 
      alt="Yantra Daan Foundation Footer" 
      width="519px" 
      style="max-width: 519px; height: auto;" 
    />
  </div>
  </div>


</div>

  `,

  // Welcome email for new admin
  welcomeNewAdmin: (newUser) => `
      <div style="font-family: Arial, sans-serif; max-width: 559px; margin: 0 auto; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
  <div style="background-color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
    <img 
      src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailHeader.png" 
      alt="Yantra Daan Foundation Header" 
      width="519px" 
      style="max-width: 519px; height: auto;" 
    />
  </div>
  <div style="text-align: right; padding-right: 30px"><strong>${formatDate()}</strong></div>
  <div style="padding: 30px 20px;">
    <div><b>A new user has registered on the Yantra Daan platform. Please review their details.</b></div>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.name}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.email}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.contact}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.userRole}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.categoryType}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.profession}</strong>,</p>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${newUser.address}</strong>,</p>
    <br>
    <br>
    <b>About the User :-</b>
    <p>${newUser.about}</p>

    </div>
      <div style="text-align: center; margin-top: 30px;">
    <img 
      src="${process.env.BACKEND_URL || 'http://localhost:5000'}/mailFooter.png" 
      alt="Yantra Daan Foundation Footer" 
      width="519px" 
      style="max-width: 519px; height: auto;" 
    />
  </div>
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

// Helper function to notify user and admins when a new user is created
const notifyNewUserCreated = async (newUser) => {
  try {
    const AdminModel = require('../models/Admin');
    
    const notificationPromises = [];

    // Send welcome email to the new user based on their role
    if (newUser.userRole === 'donor') {
      const userEmailData = {
        to: newUser.email,
        subject: 'Welcome to Yantra Daan - Donor Account Created',
        html: emailTemplates.welcomeNewDonor(newUser)
      };
      notificationPromises.push(sendEmail(userEmailData));
    } else if (newUser.userRole === 'requester') {
      const userEmailData = {
        to: newUser.email,
        subject: 'Welcome to Yantra Daan - Requester Account Created',
        html: emailTemplates.welcomeNewRequester(newUser, token)
      };
      notificationPromises.push(sendEmail(userEmailData));
    } else if (newUser.userRole === 'admin') {
      const userEmailData = {
        to: newUser.email,
        subject: 'Welcome to Yantra Daan - Admin Account Created',
        html: emailTemplates.welcomeNewAdmin(newUser)
      };
      notificationPromises.push(sendEmail(userEmailData));
    }

    // Check if any admin users exist in the database
    const admins = await AdminModel.find({ isActive: true });
    
    if (admins && admins.length > 0) {
      // Send notification to all active admins
      for (const admin of admins) {
        const adminEmailData = {
          to: admin.email,
          subject: 'New User Registered - Yantra Daan',
          html: emailTemplates.newUserCreatedToAdmin(newUser)
        };
        notificationPromises.push(sendEmail(adminEmailData));
      }
      console.log(`Notified ${admins.length} admins about new user: ${newUser.name}`);
    } else {
      // Fallback: send notification to yantradaan@gmail.com if no admins exist
      const adminEmailData = {
        to: 'yantradaan@gmail.com',
        subject: 'New User Registered - Yantra Daan',
        html: emailTemplates.newUserCreatedToAdmin(newUser)
      };
      notificationPromises.push(sendEmail(adminEmailData));
      console.log(`Notified fallback admin (yantradaan@gmail.com) about new user: ${newUser.name}`);
    }

    // Send all notifications in parallel
    const results = await Promise.allSettled(notificationPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    console.log(`New user notification sent: ${successful} successful, ${failed} failed`);
    
    return { 
      success: true, 
      notified: { user: 1, admins: admins.length || 1 },
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