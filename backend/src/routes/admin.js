const { Router } = require('express');
const UserModel = require('../models/UserModels');
const DeviceModel = require('../models/Device');
const DeviceRequestModel = require('../models/DeviceRequest');
const TeamMemberModel = require('../models/TeamMember');
const { auth, requireRole } = require('../middleware/auth');
const emailService = require('../utils/emailService'); 
const { teamMemberUpload, deviceUpload } = require('../middleware/imageUpload');

const router = Router();

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

// Get public statistics for hero page (no auth required)
router.get('/public-stats', async (req, res) => {
  try {
    // Count all approved devices (items donated)
    const itemsDonated = await DeviceModel.countDocuments({ status: 'approved' });
    
    // Count all completed requests (lives impacted)
    const livesImpacted = await DeviceRequestModel.countDocuments({ status: 'completed' });
    
    // Count all users with donor role (active donors)
    const activeDonors = await UserModel.countDocuments({ userRole: 'donor' });

    res.json({
      itemsDonated,
      livesImpacted,
      activeDonors
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to fetch public statistics' });
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

    if (!['user', 'requester', 'donor', 'admin'].includes(userRole)) {
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


    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update user details (comprehensive update)
router.put('/users/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      contact, 
      profession, 
      userRole, 
      isActive, 
      isOrganization, 
      emailUpdates, 
      location 
    } = req.body;

    // Validate user role if provided
    if (userRole && !['user', 'requester', 'donor', 'admin'].includes(userRole)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await UserModel.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (contact !== undefined) updateData.contact = contact;
    if (profession !== undefined) updateData.profession = profession;
    if (userRole !== undefined) updateData.userRole = userRole;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isOrganization !== undefined) updateData.isOrganization = isOrganization;
    if (emailUpdates !== undefined) updateData.emailUpdates = emailUpdates;
    if (location !== undefined) updateData.location = location;

    // Add admin notes and timestamp
    updateData.adminNotes = `User updated by admin on ${new Date().toISOString()}`;
    updateData.updatedAt = new Date();

    const user = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User updated successfully by admin', 
      user 
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user', 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user status (active/inactive toggle)
router.put('/users/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, adminNotes } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    const updateData = { 
      isActive,
      updatedAt: new Date()
    };
    
    if (adminNotes) updateData.adminNotes = adminNotes;

    const user = await UserModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
      .populate('ownerInfo', 'name email contact phone address city state userRole categoryType isOrganization about profession organization isVerified profilePhoto')
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

// Get device owner details
router.get('/devices/:id/owner', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await DeviceModel.findById(id)
      .populate('ownerInfo', 'name email phone contact address city state userRole categoryType isOrganization about profession organization linkedIn instagram facebook profilePhoto isVerified createdAt')
      .select('ownerId devicePhotos images title description deviceType condition location');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (!device.ownerInfo) {
      return res.status(404).json({ error: 'Owner information not found' });
    }

    res.json(device.ownerInfo);
  } catch (error) {
    console.error('Error fetching device owner:', error);
    res.status(500).json({ error: 'Failed to fetch device owner details' });
  }
});

// Update device status
router.patch('/devices/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason, suspensionReason, resetReason } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, approved, rejected, or suspended' });
    }

    // Prepare update data
    const updateData = {
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    };

    // Add specific reason fields based on status
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (suspensionReason) {
      updateData.suspensionReason = suspensionReason;
      updateData.suspendedAt = new Date();
    }
    if (resetReason) updateData.resetReason = resetReason;

    const device = await DeviceModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('ownerInfo', 'name email contact');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Send email notification to device owner
    if (device.ownerInfo && device.ownerInfo.email) {
      try {
        let emailTemplate, subject;
        
        switch (status) {
          case 'approved':
            emailTemplate = emailService.emailTemplates.devicePostApproved(device);
            subject = '✅ Device Post Approved - Yantra Daan';
            break;
          case 'rejected':
            emailTemplate = emailService.emailTemplates.devicePostRejected(
              device, 
              rejectionReason || adminNotes || 'No specific reason provided'
            );
            subject = '❌ Device Post Rejected - Yantra Daan';
            break;
          case 'suspended':
            emailTemplate = emailService.emailTemplates.devicePostSuspended(
              device, 
              suspensionReason || adminNotes || 'No specific reason provided'
            );
            subject = '⚠️ Device Post Suspended - Yantra Daan';
            break;
          case 'pending':
            // For reset to pending, don't send email notification
            break;
        }

        if (emailTemplate) {
          await emailService.sendEmail({
            to: device.ownerInfo.email,
            subject: subject,
            html: emailTemplate
          });
          
          console.log(`Email notification sent to ${device.ownerInfo.email} for device ${status}`);
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the main operation if email fails
      }
    }

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
      .populate('requesterInfo', 'name email contact profession address')
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact profession address',
          model: 'User'
        }
      })
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
      .select('name email contact role bio status avatar socialLinks createdAt')
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
    const { name, email, contact, role, bio, socialLinks, avatar } = req.body;

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
      socialLinks: socialLinks || {},
      avatar: avatar || null,
      status: 'active'
    });

    await teamMember.save();

    // EMAIL NOTIFICATION DISABLED - Welcome email commented out
    /*
    // Send welcome email
    await emailService.sendEmail({
      to: email,
      subject: '👋 Welcome to Yantra Daan Team!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">👋 Welcome to the Team!</h2>
          <p>Hello ${name},</p>
          <p>Welcome to the Yantra Daan team! You've been added as a <strong>${role}</strong>.</p>
          
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
    const { name, email, contact, role, bio, status, socialLinks, avatar } = req.body;

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
        socialLinks: socialLinks || {},
        avatar: avatar || null,
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
      subject: '🔄 Your Yantra Daan Team Profile Has Been Updated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🔄 Profile Updated</h2>
          <p>Hello ${name},</p>
          <p>Your Yantra Daan team profile has been updated by an administrator.</p>
          
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
      subject: `📊 Status Updated - Yantra Daan`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">📊 Status Updated</h2>
          <p>Hello ${member.name},</p>
          <p>Your status on the Yantra Daan team has been updated.</p>
          
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

// Upload team member image
router.post('/team-members/upload-image', auth, requireRole(['admin']), teamMemberUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate the URL for the uploaded image
    const imageUrl = `/uploads/team-members/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload device image (for device donations/posts) - Admin only
router.post('/devices/upload-image', auth, requireRole(['admin']), deviceUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate the relative path for the uploaded image (frontend will construct full URL)
    const imageUrl = `devices/${req.file.filename}`;
    
    res.json({
      message: 'Device image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading device image:', error);
    res.status(500).json({ error: 'Failed to upload device image' });
  }
});

module.exports = router;
