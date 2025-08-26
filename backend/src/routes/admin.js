const { Router } = require('express');
const UserModel = require('../models/UserModels');
const DeviceModel = require('../models/Device');
const DeviceRequestModel = require('../models/DeviceRequest');
const TeamMemberModel = require('../models/TeamMember');
const { auth, requireRole } = require('../middleware/auth');
const emailService = require('../utils/emailService'); // EMAIL SERVICE ENABLED

const router = Router();

// Test email functionality (no auth required for testing)
router.post('/test-email-public', async (req, res) => {
  try {
    const { to, subject = 'Test Email from YantraDaan' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    console.log('Attempting to send test email to:', to);
    console.log('Using SMTP credentials:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      user: process.env.SMTP_USER || 'yantradaan@gmail.com'
    });

    const testEmailHtml = emailService.emailTemplates.testEmail();
    
    const result = await emailService.sendEmail({
      to: to,
      subject: subject,
      html: testEmailHtml
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send test email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

// Test email functionality
router.post('/test-email', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { to, subject = 'Test Email from YantraDaan' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const testEmailHtml = emailService.emailTemplates.testEmail();
    
    const result = await emailService.sendEmail({
      to: to,
      subject: subject,
      html: testEmailHtml
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send test email',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Get dashboard statistics
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalDevices = await DeviceModel.countDocuments();
    const totalRequests = await DeviceRequestModel.countDocuments();
    const pendingDevices = await DeviceModel.countDocuments({ status: 'pending' });
    const approvedDevices = await DeviceModel.countDocuments({ status: 'approved' });
    const rejectedDevices = await DeviceModel.countDocuments({ status: 'rejected' });

    res.json({
      totalUsers,
      totalDevices,
      totalRequests,
      pendingDevices,
      approvedDevices,
      rejectedDevices
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all users with pagination and filters
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.userRole = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const users = await UserModel.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:id/role', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { userRole } = req.body;

    if (!['requester', 'donor', 'admin'].includes(userRole)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { userRole },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // EMAIL NOTIFICATION DISABLED - Role change notification commented out
    /*
    // Send email notification about role change
    await emailService.sendEmail({
      to: user.email,
      subject: '🔐 Role Updated - YantraDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🔐 Role Updated</h2>
            <p>Your role on YantraDaan has been updated.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534;">New Role:</h3>
              <p><strong>${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</strong></p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        `
      });
    */

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has any associated data
    const hasDevices = await DeviceModel.exists({ ownerId: id });
    const hasRequests = await DeviceRequestModel.exists({ 
      $or: [{ requesterId: id }, { 'deviceInfo.ownerId': id }] 
    });

    if (hasDevices || hasRequests) {
      return res.status(400).json({ 
        error: 'Cannot delete user with associated devices or requests' 
      });
    }

    await UserModel.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all devices with pagination and filters
router.get('/devices', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', deviceType = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (deviceType && deviceType !== 'all') {
      query.deviceType = deviceType;
    }

    const devices = await DeviceModel.find(query)
      .populate('ownerInfo', 'name email contact')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeviceModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      devices,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Update device status
router.put('/devices/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const device = await DeviceModel.findByIdAndUpdate(
      id,
      { 
        status, 
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: req.user._id
      },
      { new: true }
    ).populate('ownerInfo', 'name email contact');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // EMAIL NOTIFICATION DISABLED - Device status notification commented out
    /*
    // Send email notification to device owner
    if (device.ownerInfo && device.ownerInfo.email) {
      const emailTemplate = status === 'approved' 
        ? emailService.emailTemplates.devicePostApproved(device)
        : emailService.emailTemplates.devicePostRejected(device, adminNotes || 'No specific reason provided');

      await emailService.sendEmail({
        to: device.ownerInfo.email,
        subject: status === 'approved' 
          ? '✅ Device Post Approved - YantraDaan'
          : '❌ Device Post Rejected - YantraDaan',
        html: emailTemplate
      });
    }
    */

    res.json({ message: 'Device status updated successfully', device });
  } catch (error) {
    console.error('Error updating device status:', error);
    res.status(500).json({ error: 'Failed to update device status' });
  }
});

// Get all device requests with pagination and filters
router.get('/requests', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'requesterInfo.name': { $regex: search, $options: 'i' } },
        { 'deviceInfo.title': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await DeviceRequestModel.find(query)
      .populate('requesterInfo', 'name email contact')
      .populate('deviceInfo', 'title deviceType condition ownerInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DeviceRequestModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      requests,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Team Member Management Endpoints

// Get all team members
router.get('/team-members', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const members = await TeamMemberModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TeamMemberModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      members,
      total,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Add new team member
router.post('/team-members', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, contact, role, bio } = req.body;

    // Check if team member already exists
    const existingMember = await TeamMemberModel.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ error: 'Team member with this email already exists' });
    }

    // Create new team member
    const teamMember = new TeamMemberModel({
      name,
      email,
      contact,
      role,
      bio,
      status: 'active'
    });

    await teamMember.save();

    // EMAIL NOTIFICATION DISABLED - Welcome email commented out
    /*
    // Send welcome email
    await emailService.sendEmail({
      to: email,
      subject: '👋 Welcome to YantraDaan Team!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">👋 Welcome to the Team!</h2>
          <p>Hello ${name},</p>
          <p>Welcome to the YantraDaan team! You've been added as a <strong>${role}</strong>.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534;">Your Details:</h3>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p>You'll receive login credentials separately. If you have any questions, please contact the admin team.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Welcome aboard! 🚀
          </p>
        </div>
      `
    });
    */

    res.status(201).json({ 
      message: 'Team member added successfully', 
      member: teamMember 
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// Update team member
router.put('/team-members/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contact, role, bio, status } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingMember = await TeamMemberModel.findOne({ email, _id: { $ne: id } });
      if (existingMember) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update team member
    const updatedMember = await TeamMemberModel.findByIdAndUpdate(
      id,
      {
        name,
        email,
        contact,
        role,
        bio,
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // EMAIL NOTIFICATION DISABLED - Update notification email commented out
    /*
    // Send update notification email
    await emailService.sendEmail({
      to: email,
      subject: '🔄 Your YantraDaan Team Profile Has Been Updated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🔄 Profile Updated</h2>
          <p>Hello ${name},</p>
          <p>Your YantraDaan team profile has been updated by an administrator.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534;">Updated Details:</h3>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Status:</strong> ${status}</p>
          </div>
          
          <p>If you have any questions about these changes, please contact the admin team.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Thank you for being part of our team! 🙏
          </p>
        </div>
      `
    });
    */

    res.json({ 
      message: 'Team member updated successfully', 
      member: updatedMember 
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// Update team member status
router.patch('/team-members/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const member = await TeamMemberModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // EMAIL NOTIFICATION DISABLED - Status update email commented out
    /*
    // Send status update email
    await emailService.sendEmail({
      to: member.email,
      subject: `📊 Status Updated - YantraDaan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">📊 Status Updated</h2>
          <p>Hello ${member.name},</p>
          <p>Your status on the YantraDaan team has been updated.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534;">New Status:</h3>
            <p><strong>${status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
          </div>
          
          <p>If you have any questions about this change, please contact the admin team.</p>
        </div>
      `
    });
    */

    res.json({ 
      message: 'Status updated successfully', 
      member 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete team member
router.delete('/team-members/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await TeamMemberModel.findById(id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Check if member has any critical responsibilities
    if (member.role === 'Founder & CEO') {
      const founderCount = await TeamMemberModel.countDocuments({ role: 'Founder & CEO', status: 'active' });
      if (founderCount <= 1) {
        return res.status(400).json({ 
          error: 'Cannot delete the last active founder' 
        });
      }
    }

    await TeamMemberModel.findByIdAndDelete(id);

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

module.exports = router;
