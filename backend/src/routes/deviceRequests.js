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
    const device = await DeviceModel.findById(deviceId).populate('ownerId', 'name email contact');
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.status !== 'approved') {
      return res.status(400).json({ error: 'Device is not available for requests' });
    }

    // Check if user already has a request for this device
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

    // Check if requester is verified before allowing requests
    if (req.user.verificationStatus !== 'verified') {
      return res.status(403).json({ 
        error: 'Only verified users can request devices. Please complete the verification process first.' 
      });
    }

    // Check if requester has reached the 3-device limit
    // Only apply limit to verified requesters
    const activeRequestCount = await DeviceRequestModel.countDocuments({
      requesterId: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (activeRequestCount >= 3) {
      return res.status(400).json({ 
        error: 'You have reached the maximum limit of 3 active device requests. Please wait for existing requests to be processed before making new ones.' 
      });
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
    await request.populate({
      path: 'deviceInfo',
      select: 'title deviceType condition ownerId',
      populate: {
        path: 'ownerId',
        select: 'name email contact',
        model: 'User'
      }
    });

    // Send notification to device owner
    if (request.deviceInfo.ownerId && request.deviceInfo.ownerId.email) {
      await emailService.sendEmail({
        to: request.deviceInfo.ownerId.email,
        subject: '📱 New Device Request - Yantra Daan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">📱 New Device Request</h2>
            <p>Someone has requested your donated device.</p>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534;">Device Details:</h3>
              <p><strong>Title:</strong> ${request.deviceInfo.title}</p>
              <p><strong>Type:</strong> ${request.deviceInfo.deviceType}</p>
              <p><strong>Condition:</strong> ${request.deviceInfo.condition}</p>
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
              <p><strong>Title:</strong> ${request.deviceInfo.title}</p>
              <p><strong>Type:</strong> ${request.deviceInfo.deviceType}</p>
              <p><strong>Condition:</strong> ${request.deviceInfo.condition}</p>
              <p><strong>Donor:</strong> ${request.deviceInfo.ownerId?.name || 'Unknown'}</p>
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
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact',
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
      .populate({
        path: 'deviceInfo',
        select: 'title description deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact',
          model: 'User'
        }
      });

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

// Get device request by ID (device owner only)
router.get('/device/request/:id', auth, async (req, res) => {
  try {
    const request = await DeviceRequestModel.findById(req.params.id)
      .populate('requesterInfo', 'name email contact address profession profilePhoto')
      .populate({
        path: 'deviceInfo',
        select: 'title description deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact',
          model: 'User'
        }
      });

    if (!request) {
      return res.status(404).json({ error: 'Device request not found' });
    }

    // Check if the current user is the device owner
    if (request.deviceInfo.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only view requests for your own devices.' });
    }

    res.json({ request });

  } catch (error) {
    console.error('Device owner get request error:', error);
    res.status(500).json({
      error: 'Failed to get device request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Device owner approve/reject device request
router.put('/device/:id/status', auth, async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be approved or rejected' 
      });
    }

    const request = await DeviceRequestModel.findById(req.params.id)
      .populate('requesterInfo', 'name email contact')
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email',
          model: 'User'
        }
      });

    if (!request) {
      return res.status(404).json({ error: 'Device request not found' });
    }

    // Check if user is the device owner
    const isDeviceOwner = request.deviceInfo.ownerId.toString() === req.user._id.toString();
    
    if (!isDeviceOwner) {
      return res.status(403).json({ error: 'Access denied. Only device owners can update request status.' });
    }

    // If this is an approval, reject all other pending requests for the same device
    if (status === 'approved') {
      // Find all other pending requests for the same device
      const otherRequests = await DeviceRequestModel.find({
        deviceId: request.deviceId,
        _id: { $ne: request._id },
        status: 'pending'
      });

      // Reject all other pending requests
      for (const otherRequest of otherRequests) {
        otherRequest.status = 'rejected';
        otherRequest.rejectionReason = 'Device assigned to another recipient';
        otherRequest.adminNotes = 'Auto-rejected when device owner approved another request';
        await otherRequest.save();
        
        // Notify the requester of the other request
        const otherRequester = await UserModel.findById(otherRequest.requesterId);
        if (otherRequester && otherRequester.email) {
          await emailService.sendEmail({
            to: otherRequester.email,
            subject: '❌ Device Request Rejected - Yantra Daan',
            html: emailService.emailTemplates.requestRejected(otherRequest.toObject())
          });
        }
      }
      
      // Update the device status to prevent further requests and hide from public view
      const device = await DeviceModel.findById(request.deviceId);
      if (device) {
        device.status = 'assigned';
        device.isActive = false; // Hide device from public view
        await device.save();
      }
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
        to: request.deviceInfo.ownerId.email,
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
    console.error('Device owner update request status error:', error);
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

    // Check if requester is verified
    if (req.user.verificationStatus !== 'verified') {
      return res.json({ 
        canRequest: false, 
        reason: 'Only verified users can request devices. Please complete the verification process first.' 
      });
    }

    // Check if requester has reached the 3-device limit
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

    return res.json({ 
      canRequest: true,
      activeRequestCount: await DeviceRequestModel.countDocuments({
        requesterId: req.user._id,
        status: { $in: ['pending', 'approved'] }
      })
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
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition status',
        populate: {
          path: 'ownerId',
          select: 'name email contact profession address',
          model: 'User'
        }
      })
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
      .populate('requesterInfo', 'name profilePhoto')
      .select('requesterInfo message status createdAt adminNotes rejectionReason')
      .sort({ createdAt: -1 });
    
    res.json({ 
      requests: requests.map(req => ({
        _id: req._id,
        name: req.requesterInfo?.name || 'Anonymous',
        message: req.message,
        status: req.status,
        createdAt: req.createdAt,
        adminNotes: req.adminNotes,
        rejectionReason: req.rejectionReason,
        profilePhoto: req.requesterInfo?.profilePhoto
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

// Get device request by ID (device owner only)
router.get('/device/request/:id', auth, async (req, res) => {
  try {
    const request = await DeviceRequestModel.findById(req.params.id)
      .populate('requesterInfo', 'name email contact address profession profilePhoto')
      .populate({
        path: 'deviceInfo',
        select: 'title description deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact',
          model: 'User'
        }
      });

    if (!request) {
      return res.status(404).json({ error: 'Device request not found' });
    }

    // Check if the current user is the device owner
    if (request.deviceInfo.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only view requests for your own devices.' });
    }

    res.json({ request });

  } catch (error) {
    console.error('Device owner get request error:', error);
    res.status(500).json({
      error: 'Failed to get device request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin approve/reject device request
router.put('/admin/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be approved or rejected' 
      });
    }

    const request = await DeviceRequestModel.findById(req.params.id)
      .populate('requesterInfo', 'name email contact')
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email',
          model: 'User'
        }
      });

    if (!request) {
      return res.status(404).json({ error: 'Device request not found' });
    }

    // If this is an approval, reject all other pending requests for the same device
    if (status === 'approved') {
      // Find all other pending requests for the same device
      const otherRequests = await DeviceRequestModel.find({
        deviceId: request.deviceId,
        _id: { $ne: request._id },
        status: 'pending'
      });

      // Reject all other pending requests
      for (const otherRequest of otherRequests) {
        otherRequest.status = 'rejected';
        otherRequest.rejectionReason = 'Device assigned to another recipient';
        otherRequest.adminNotes = 'Auto-rejected when admin approved another request';
        await otherRequest.save();
        
        // Notify the requester of the other request
        const otherRequester = await UserModel.findById(otherRequest.requesterId);
        if (otherRequester && otherRequester.email) {
          await emailService.sendEmail({
            to: otherRequester.email,
            subject: '❌ Device Request Rejected - Yantra Daan',
            html: emailService.emailTemplates.requestRejected(otherRequest.toObject())
          });
        }
      }
      
      // Update the device status to prevent further requests and hide from public view
      const device = await DeviceModel.findById(request.deviceId);
      if (device) {
        device.status = 'assigned';
        device.isActive = false; // Hide device from public view
        await device.save();
      }
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
        to: request.deviceInfo.ownerId.email,
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

// Generate invoice for approved request (requester only)
router.get('/my/:id/invoice', auth, async (req, res) => {
  try {
    const request = await DeviceRequestModel.findOne({
      _id: req.params.id,
      requesterId: req.user._id,
      status: 'approved'
    })
      .populate('requesterInfo', 'name email contact')
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact',
          model: 'User'
        }
      });

    if (!request) {
      return res.status(404).json({ error: 'Approved request not found or not owned by you' });
    }

    // Generate invoice HTML
    const invoiceHtml = emailService.emailTemplates.generateInvoice(request.toObject());
    
    // Send invoice as HTML response
    res.setHeader('Content-Type', 'text/html');
    res.send(invoiceHtml);

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      error: 'Failed to generate invoice',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all devices with requests for a specific donor (donor profile)
router.get('/donor/profile', auth, async (req, res) => {
  try {
    // Get all devices owned by the donor
    const devices = await DeviceModel.find({ ownerId: req.user._id })
      .populate('ownerInfo', 'name email contact')
      .sort({ createdAt: -1 });

    // Get all requests for these devices
    const deviceIds = devices.map(device => device._id);
    const requests = await DeviceRequestModel.find({ deviceId: { $in: deviceIds } })
      .populate('requesterInfo', 'name email contact address profession profilePhoto')
      .populate({
        path: 'deviceInfo',
        select: 'title deviceType condition ownerId',
        populate: {
          path: 'ownerId',
          select: 'name email contact',
          model: 'User'
        }
      })
      .sort({ createdAt: -1 });

    // Group requests by device
    const requestsByDevice = {};
    requests.forEach(request => {
      if (!requestsByDevice[request.deviceId]) {
        requestsByDevice[request.deviceId] = [];
      }
      requestsByDevice[request.deviceId].push(request);
    });

    // Combine device info with requests
    const devicesWithRequests = devices.map(device => ({
      ...device.toObject(),
      requests: requestsByDevice[device._id] || []
    }));

    res.json({
      devices: devicesWithRequests,
      stats: {
        totalDevices: devices.length,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        approvedRequests: requests.filter(r => r.status === 'approved').length,
        completedRequests: requests.filter(r => r.status === 'completed').length,
        rejectedRequests: requests.filter(r => r.status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('Get donor profile data error:', error);
    res.status(500).json({
      error: 'Failed to get donor profile data',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;