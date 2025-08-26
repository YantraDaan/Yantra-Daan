const { Router } = require('express');
const DeviceModel = require('../models/Device');
const DeviceRequestModel = require('../models/DeviceRequest');
const UserModel = require('../models/UserModels');
const { auth, requireRole } = require('../middleware/auth');
const { validateDevicePost } = require('../middleware/validation');
// const emailService = require('../utils/emailService'); // EMAIL SERVICE DISABLED

const router = Router();

// Post a new device (requires authentication)
router.post('/', auth, validateDevicePost, async (req, res) => {
  try {
    const deviceData = {
      ...req.body,
      ownerId: req.user._id,
      status: 'pending' // Always starts as pending
    };

    const device = new DeviceModel(deviceData);
    await device.save();

    // Populate owner info for email
    await device.populate('ownerInfo');

    // EMAIL NOTIFICATIONS DISABLED - Admin notification commented out
    /*
    // Send notification to all admin users
    const adminUsers = await UserModel.find({ userRole: 'admin' });
    
    for (const admin of adminUsers) {
      await emailService.sendEmail({
        to: admin.email,
        subject: '🆕 New Device Post Requires Approval - Yantra Daan',
        html: emailService.emailTemplates.newDevicePost(device.toObject(), req.user.toObject())
      });
    }
    */

    res.status(201).json({
      message: 'Device post submitted successfully and is pending admin approval',
      device: {
        ...device.toObject(),
        ownerId: undefined // Don't send owner ID in response
      }
    });

  } catch (error) {
    console.error('Device post error:', error);
    res.status(500).json({
      error: 'Failed to post device',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all approved devices (public)
router.get('/approved', async (req, res) => {
  try {
    const { page = 1, limit = 20, deviceType, condition, location } = req.query;
    
    const filter = { status: 'approved' };
    if (deviceType) filter.deviceType = deviceType;
    if (condition) filter.condition = condition;
    if (location) filter['location.city'] = { $regex: location, $options: 'i' };

    const devices = await DeviceModel.find(filter)
      .populate('ownerInfo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeviceModel.countDocuments(filter);

    res.json({
      devices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get approved devices error:', error);
    res.status(500).json({
      error: 'Failed to get approved devices',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get device by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const device = await DeviceModel.findById(req.params.id)
      .populate('ownerInfo', 'name email');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(device);

  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      error: 'Failed to get device',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update device (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const device = await DeviceModel.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own devices.' });
    }

    const updatedDevice = await DeviceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ownerInfo', 'name email');

    res.json({
      message: 'Device updated successfully',
      device: updatedDevice
    });

  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      error: 'Failed to update device',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete device (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await DeviceModel.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (device.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own devices.' });
    }

    await DeviceModel.findByIdAndDelete(req.params.id);

    res.json({ message: 'Device deleted successfully' });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      error: 'Failed to delete device',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ===== ADMIN ROUTES =====

// Get all devices for admin (admin only)
router.get('/admin/all', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, deviceType, condition } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (deviceType) filter.deviceType = deviceType;
    if (condition) filter.condition = condition;

    const devices = await DeviceModel.find(filter)
      .populate('ownerInfo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeviceModel.countDocuments(filter);

    res.json({
      devices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Admin get devices error:', error);
    res.status(500).json({
      error: 'Failed to get devices',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get pending devices (admin only)
router.get('/pending', auth, requireRole(['admin']), async (req, res) => {
  try {
    const devices = await DeviceModel.find({ status: 'pending' })
      .populate('ownerInfo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ devices });

  } catch (error) {
    console.error('Get pending devices error:', error);
    res.status(500).json({
      error: 'Failed to get pending devices',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update device status (admin only)
router.put('/:id/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, rejectionReason, adminNotes } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
    }

    const updateData = { status };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'approved') updateData.approvedAt = new Date();
    if (status === 'rejected') updateData.rejectedAt = new Date();

    const device = await DeviceModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerInfo', 'name email');

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // EMAIL NOTIFICATIONS DISABLED - Device status notifications commented out
    /*
    // Send email notification to device owner
    try {
      if (status === 'approved') {
        await emailService.sendEmail({
          to: device.ownerInfo.email,
          subject: '✅ Device Post Approved - Yantra Daan',
          html: emailService.emailTemplates.devicePostApproved(device.toObject())
        });
      } else if (status === 'rejected') {
        await emailService.sendEmail({
          to: device.ownerInfo.email,
          subject: '❌ Device Post Rejected - Yantra Daan',
          html: emailService.emailTemplates.devicePostRejected(device.toObject(), rejectionReason)
        });
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Continue even if email fails
    }
    */

    res.json({
      message: `Device ${status} successfully`,
      device
    });

  } catch (error) {
    console.error('Update device status error:', error);
    res.status(500).json({
      error: 'Failed to update device status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete device (admin only)
router.delete('/admin/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const device = await DeviceModel.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json({ message: 'Device deleted successfully' });

  } catch (error) {
    console.error('Admin delete device error:', error);
    res.status(500).json({
      error: 'Failed to delete device',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get device statistics (admin only)
router.get('/admin/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await DeviceModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const deviceTypeStats = await DeviceModel.aggregate([
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const statusStats = await DeviceModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      monthlyStats: stats,
      deviceTypeStats,
      statusStats
    });

  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({
      error: 'Failed to get device statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
