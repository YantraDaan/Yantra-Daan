const { Router } = require('express');
const DeviceRequestModel = require('../models/DeviceRequest');
const DeviceModel = require('../models/Device');
const UserModel = require('../models/UserModels');
const { auth, requireRole } = require('../middleware/auth');
const emailService = require('../utils/emailService'); // EMAIL SERVICE ENABLED

const router = Router();

// Create a new device request (authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { deviceId, message } = req.body;

    if (!deviceId || !message) {
      return res.status(400).json({ 
        error: 'Device ID and message are required' 
      });
    }

    // Check if device exists and is approved
    const device = await DeviceModel.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.status !== 'approved') {
      return res.status(400).json({ error: 'Device is not available for requests' });
    }

    // Check if user already has a pending request for this device
    const existingRequest = await DeviceRequestModel.findOne({
      requesterId: req.user._id,
      deviceId: deviceId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You already have a request for this device' 
      });
    }

    // Check if requester has reached the 3-device limit
    if (req.user.userRole === 'requester' || req.user.userRole === 'student') {
      const activeRequestCount = await DeviceRequestModel.countDocuments({
        requesterId: req.user._id,
        status: { $in: ['pending', 'approved'] }
      });

      if (activeRequestCount >= 3) {
        return res.status(400).json({ 
          error: 'You have reached the maximum limit of 3 active device requests. Please wait for existing requests to be processed before making new ones.' 
        });
      }
    }

    // Create the request
    const request = new DeviceRequestModel({
      requesterId: req.user._id,
      deviceId: deviceId,
      message: message
    });

    await request.save();

    // Populate device and requester info for notifications
    await request.populate('deviceInfo', 'title deviceType condition ownerId');
    await request.populate('requesterInfo', 'name email contact');
    await request.populate('deviceInfo.ownerInfo', 'name email contact');

    // Send notification to device owner
    if (device.ownerInfo && device.ownerInfo.email) {
      await emailService.sendEmail({
        to: device.ownerInfo.email,
        subject: '📱 New Device Request - Yantra Daan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">📱 New Device Request</h2>
            <p>Someone has requested your donated device.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534;">Device Details:</h3>
              <p><strong>Title:</strong> ${device.title}</p>
              <p><strong>Type:</strong> ${device.deviceType}</p>
              <p><strong>Condition:</strong> ${device.condition}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e;">Requester Message:</h3>
              <p>${message}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Admin will review this request and notify you of the decision.
            </p>
          </div>
        `
      });
    }

    // Send notification to all admin users
    const adminUsers = await UserModel.find({ userRole: 'admin' });
    
    for (const admin of adminUsers) {
      await emailService.sendEmail({
        to: admin.email,
        subject: '📱 New Device Request Requires Review - Yantra Daan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">📱 New Device Request</h2>
            <p>A new device request requires your review.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e;">Requester Information:</h3>
              <p><strong>Name:</strong> ${req.user.name}</p>
              <p><strong>Email:</strong> ${req.user.email}</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534;">Device Information:</h3>
              <p><strong>Title:</strong> ${device.title}</p>
              <p><strong>Type:</strong> ${device.deviceType}</p>
              <p><strong>Condition:</strong> ${device.condition}</p>
              <p><strong>Donor:</strong> ${device.ownerInfo?.name || 'Unknown'}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Please review this request in the admin panel.
            </p>
          </div>
        `
      });
    }

    res.status(201).json({
      message: 'Device request submitted successfully',
      request: {
        ...request.toObject(),
        requesterId: undefined
      }
    });

  } catch (error) {
    console.error('Create device request error:', error);
    res.status(500).json({
      error: 'Failed to create device request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all device requests (admin only)
router.get('/admin/all', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const requests = await DeviceRequestModel.find(filter)
      .populate('requesterInfo', 'name email contact profession address')
      .populate('deviceInfo', 'title deviceType condition ownerId')
      .populate('deviceInfo.ownerInfo', 'name email contact profession address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeviceRequestModel.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Admin get requests error:', error);
    res.status(500).json({
      error: 'Failed to get device requests',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get device request by ID (admin only)
router.get('/admin/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const request = await DeviceRequestModel.findById(req.params.id)
      .populate('requesterInfo', 'name email contact')
      .populate('deviceInfo', 'title description deviceType condition ownerId')
      .populate('deviceInfo.ownerInfo', 'name email contact');

    if (!request) {
      return res.status(404).json({ error: 'Device request not found' });
    }

    res.json({ request });

  } catch (error) {
    console.error('Admin get request error:', error);
    res.status(500).json({
      error: 'Failed to get device request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin or device owner approve/reject device request
router.put('/admin/:id/status', auth, async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be approved, rejected, or completed' 
      });
    }

    const request = await DeviceRequestModel.findById(req.params.id)
      .populate('requesterInfo', 'name email contact')
      .populate('deviceInfo', 'title deviceType condition ownerId')
      .populate('deviceInfo.ownerInfo', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Device request not found' });
    }

    // Check if user is admin or device owner
    const isAdmin = req.user.userRole === 'admin';
    const isDeviceOwner = request.deviceInfo.ownerId.toString() === req.user._id.toString();
    
    if (!isAdmin && !isDeviceOwner) {
      return res.status(403).json({ error: 'Access denied. Only admins or device owners can update request status.' });
    }

    // Update request status
    request.status = status;
    request.adminNotes = adminNotes || '';
    
    if (status === 'approved') {
      request.approvedBy = req.user._id;
      request.approvedAt = new Date();
      request.rejectionReason = undefined;
    } else if (status === 'rejected') {
      request.rejectionReason = rejectionReason || 'No reason provided';
      request.approvedBy = undefined;
      request.approvedAt = undefined;
    } else if (status === 'completed') {
      request.completedAt = new Date();
    }

    await request.save();

    // Send notifications
    if (status === 'approved') {
      // Notify requester
      await emailService.sendEmail({
        to: request.requesterInfo.email,
        subject: '✅ Device Request Approved - Yantra Daan',
        html: emailService.emailTemplates.requestApproved(request.toObject())
      });

      // Notify device owner
      await emailService.sendEmail({
        to: request.deviceInfo.ownerInfo.email,
        subject: '📱 Device Request Approved - Contact Requester - Yantra Daan',
        html: emailService.emailTemplates.requestApprovedToOwner(request.toObject())
      });

    } else if (status === 'rejected') {
      // Notify requester of rejection
      await emailService.sendEmail({
        to: request.requesterInfo.email,
        subject: '❌ Device Request Rejected - Yantra Daan',
        html: emailService.emailTemplates.requestRejected(request.toObject())
      });
    }

    res.json({
      message: `Device request ${status} successfully`,
      request: {
        ...request.toObject(),
        requesterId: undefined
      }
    });

  } catch (error) {
    console.error('Admin update request status error:', error);
    res.status(500).json({
      error: 'Failed to update request status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Check if user can request a specific device (for frontend validation)
router.get('/can-request/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Check if device exists and is approved
    const device = await DeviceModel.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.status !== 'approved') {
      return res.json({ 
        canRequest: false, 
        reason: 'Device is not available for requests' 
      });
    }

    // Check if user already has a request for this device
    const existingRequest = await DeviceRequestModel.findOne({
      requesterId: req.user._id,
      deviceId: deviceId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.json({ 
        canRequest: false, 
        reason: 'You already have a request for this device',
        existingRequest: {
          id: existingRequest._id,
          status: existingRequest.status,
          message: existingRequest.message,
          createdAt: existingRequest.createdAt
        }
      });
    }

    // Check if requester has reached the 3-device limit
    if (req.user.userRole === 'requester' || req.user.userRole === 'student') {
      const activeRequestCount = await DeviceRequestModel.countDocuments({
        requesterId: req.user._id,
        status: { $in: ['pending', 'approved'] }
      });

      if (activeRequestCount >= 3) {
        return res.json({ 
          canRequest: false, 
          reason: 'You have reached the maximum limit of 3 active device requests' 
        });
      }
    }

    return res.json({ 
      canRequest: true,
      activeRequestCount: req.user.userRole === 'requester' || req.user.userRole === 'student' 
        ? await DeviceRequestModel.countDocuments({
            requesterId: req.user._id,
            status: { $in: ['pending', 'approved'] }
          })
        : 0
    });

  } catch (error) {
    console.error('Check can request error:', error);
    res.status(500).json({
      error: 'Failed to check request eligibility',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user's own requests
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await DeviceRequestModel.find({ requesterId: req.user._id })
      .populate('deviceInfo', 'title deviceType condition status')
      .populate('deviceInfo.ownerInfo', 'name email contact profession address')
      .sort({ createdAt: -1 });

    res.json({ requests });

  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      error: 'Failed to get your requests',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user's own request by ID
router.get('/my/:id', auth, async (req, res) => {
  try {
    const request = await DeviceRequestModel.findOne({
      _id: req.params.id,
      requesterId: req.user._id
    }).populate('deviceInfo', 'title description deviceType condition status location');

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not owned by you' });
    }

    res.json({ request });

  } catch (error) {
    console.error('Get my request error:', error);
    res.status(500).json({
      error: 'Failed to get request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Cancel user's own request
router.delete('/my/:id', auth, async (req, res) => {
  try {
    const request = await DeviceRequestModel.findOneAndDelete({
      _id: req.params.id,
      requesterId: req.user._id
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not owned by you' });
    }

    res.json({ message: 'Request cancelled successfully' });

  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      error: 'Failed to cancel request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get requests for a specific device (device owner only)
router.get('/device/:deviceId', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // First check if the device exists and belongs to the user
    const device = await DeviceModel.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (device.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only view requests for your own devices.' });
    }
    
    const requests = await DeviceRequestModel.find({ deviceId })
      .populate('requesterInfo', 'name email contact')
      .sort({ createdAt: -1 });
    
    res.json({ requests });
    
  } catch (error) {
    console.error('Get device requests error:', error);
    res.status(500).json({
      error: 'Failed to get device requests',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get public device requesters for a specific device (public endpoint)
router.get('/public/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Check if the device exists and is approved
    const device = await DeviceModel.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (device.status !== 'approved') {
      return res.status(400).json({ error: 'Device is not available for viewing requests' });
    }
    
    const requests = await DeviceRequestModel.find({ deviceId })
      .populate('requesterInfo', 'name email contact profession')
      .select('requesterInfo message status createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ 
      requests: requests.map(req => ({
        _id: req._id,
        name: req.requesterInfo?.name || 'Anonymous',
        email: req.requesterInfo?.email || '',
        contact: req.requesterInfo?.contact || '',
        profession: req.requesterInfo?.profession || '',
        message: req.message,
        status: req.status,
        createdAt: req.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get public device requests error:', error);
    res.status(500).json({
      error: 'Failed to get device requests',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get request statistics (admin only)
router.get('/admin/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const stats = await DeviceRequestModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRequests = await DeviceRequestModel.countDocuments();
    const pendingCount = stats.find(s => s._id === 'pending')?.count || 0;
    const approvedCount = stats.find(s => s._id === 'approved')?.count || 0;
    const rejectedCount = stats.find(s => s._id === 'rejected')?.count || 0;
    const completedCount = stats.find(s => s._id === 'completed')?.count || 0;

    res.json({
      total: totalRequests,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      completed: completedCount
    });

  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      error: 'Failed to get request statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
