const DeviceModel = require('../models/Device');
const UserModel = require('../models/UserModels');
// const emailService = require('../utils/emailService'); // EMAIL SERVICE DISABLED

// Create a new device donation post
const createDeviceDonation = async (req, res) => {
  try {
    const {
      title,
      description,
      deviceType,
      condition,
      location,
      contactInfo,
      images,
      devicePhotos
    } = req.body;

    // Validate required fields only
    if (!title || !description || !deviceType || !condition) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'deviceType', 'condition']
      });
    }

    // Create device donation with pending status
    const deviceData = {
      ownerId: req.user._id,
      title,
      description,
      deviceType,
      condition,
      location: location || {},
      contactInfo: contactInfo || {},
      images: images || [],
      devicePhotos: devicePhotos || [],
      status: 'pending' // Always starts as pending for admin approval
    };

    const device = new DeviceModel(deviceData);
    await device.save();

    // Populate owner info for notifications
    await device.populate('ownerInfo');

    // EMAIL NOTIFICATIONS DISABLED - Admin notifications commented out
    /*
    // Send notification to all admin users
    const adminUsers = await UserModel.find({ userRole: 'admin' });
    
    for (const admin of adminUsers) {
      await emailService.notifyAdminNewDevice(
        admin.email,
        device.toObject(),
        req.user.toObject()
      );
    }
    */

    res.status(201).json({
      message: 'Device donation submitted successfully and is pending admin approval',
      device: {
        ...device.toObject(),
        ownerId: undefined // Don't send owner ID in response
      }
    });

  } catch (error) {
    console.error('Create device donation error:', error);
    res.status(500).json({
      error: 'Failed to create device donation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all approved device donations (public)
const getApprovedDeviceDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, deviceType, condition, city, state } = req.query;
    
    const filter = { status: 'approved', isActive: true };
    
    if (deviceType) filter.deviceType = deviceType;
    if (condition) filter.condition = condition;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (state) filter['location.state'] = { $regex: state, $options: 'i' };

    const devices = await DeviceModel.find(filter)
      .populate('ownerInfo', 'name email city state')
      .select('-adminNotes -approvedBy -approvedAt -rejectionReason')
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
    console.error('Get approved device donations error:', error);
    res.status(500).json({
      error: 'Failed to get device donations',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get device donation by ID (public for approved devices)
const getDeviceDonationById = async (req, res) => {
  try {
    const device = await DeviceModel.findById(req.params.id)
      .populate('ownerInfo', 'name email city state')
      .select('-adminNotes -approvedBy -approvedAt -rejectionReason');

    if (!device) {
      return res.status(404).json({ error: 'Device donation not found' });
    }

    if (device.status !== 'approved') {
      return res.status(403).json({ error: 'Device donation is not available for viewing' });
    }

    res.json({ device });

  } catch (error) {
    console.error('Get device donation error:', error);
    res.status(500).json({
      error: 'Failed to get device donation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's own device donations
const getUserDeviceDonations = async (req, res) => {
  try {
    const devices = await DeviceModel.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ devices });

  } catch (error) {
    console.error('Get user device donations error:', error);
    res.status(500).json({
      error: 'Failed to get your device donations',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user's own device donation
const updateUserDeviceDonation = async (req, res) => {
  try {
    const device = await DeviceModel.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!device) {
      return res.status(404).json({ error: 'Device donation not found or not owned by you' });
    }

    // If device was approved, changing it requires re-approval
    if (device.status === 'approved') {
      device.status = 'pending';
      device.adminNotes = '';
      device.approvedBy = undefined;
      device.approvedAt = undefined;
    }

    // Update device data
    Object.assign(device, req.body);
    await device.save();

    // EMAIL NOTIFICATIONS DISABLED - Admin notifications commented out
    /*
    // If status changed to pending, notify admins
    if (device.status === 'pending') {
      const adminUsers = await UserModel.find({ userRole: 'admin' });
      
      for (const admin of adminUsers) {
        await emailService.notifyAdminNewDevice(
          admin.email,
          device.toObject(),
          req.user.toObject()
        );
      }
    }
    */

    res.json({
      message: 'Device donation updated successfully',
      device: {
        ...device.toObject(),
        ownerId: undefined
      }
    });

  } catch (error) {
    console.error('Update device donation error:', error);
    res.status(500).json({
      error: 'Failed to update device donation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user's own device donation
const deleteUserDeviceDonation = async (req, res) => {
  try {
    const device = await DeviceModel.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!device) {
      return res.status(404).json({ error: 'Device donation not found or not owned by you' });
    }

    res.json({ message: 'Device donation deleted successfully' });

  } catch (error) {
    console.error('Delete device donation error:', error);
    res.status(500).json({
      error: 'Failed to delete device donation',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Admin: Get all device donations for approval
const getAllDeviceDonationsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const devices = await DeviceModel.find(filter)
      .populate('ownerInfo', 'name email phone')
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
    console.error('Admin get device donations error:', error);
    res.status(500).json({
      error: 'Failed to get device donations',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Admin: Approve/reject device donation
const updateDeviceDonationStatus = async (req, res) => {
  try {
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }

    const device = await DeviceModel.findById(req.params.id)
      .populate('ownerInfo', 'name email');

    if (!device) {
      return res.status(404).json({ error: 'Device donation not found' });
    }

    // Update device status
    device.status = status;
    device.adminNotes = adminNotes || '';
    
    if (status === 'approved') {
      device.approvedBy = req.user._id;
      device.approvedAt = new Date();
      device.rejectionReason = undefined;
    } else if (status === 'rejected') {
      device.rejectionReason = rejectionReason || 'No reason provided';
      device.approvedBy = undefined;
      device.approvedAt = undefined;
    }

    await device.save();

    // EMAIL NOTIFICATIONS DISABLED - Device status notifications commented out
    /*
    // Send notification to device owner
    if (status === 'approved') {
      await emailService.notifyDeviceApproved(
        device.ownerInfo.email,
        device.toObject(),
        req.user.toObject()
      );
    } else if (status === 'rejected') {
      await emailService.notifyDeviceRejected(
        device.ownerInfo.email,
        device.toObject(),
        rejectionReason
      );
    }
    */

    res.json({
      message: `Device donation ${status} successfully`,
      device: {
        ...device.toObject(),
        ownerId: undefined
      }
    });

  } catch (error) {
    console.error('Admin update device donation status error:', error);
    res.status(500).json({
      error: 'Failed to update device donation status',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get device donation statistics
const getDeviceDonationStats = async (req, res) => {
  try {
    const stats = await DeviceModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDevices = await DeviceModel.countDocuments();
    const pendingDevices = await DeviceModel.countDocuments({ status: 'pending' });
    const approvedDevices = await DeviceModel.countDocuments({ status: 'approved' });
    const rejectedDevices = await DeviceModel.countDocuments({ status: 'rejected' });

    res.json({
      total: totalDevices,
      pending: pendingDevices,
      approved: approvedDevices,
      rejected: rejectedDevices,
      breakdown: stats
    });

  } catch (error) {
    console.error('Get device donation stats error:', error);
    res.status(500).json({
      error: 'Failed to get device donation statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createDeviceDonation,
  getApprovedDeviceDonations,
  getDeviceDonationById,
  getUserDeviceDonations,
  updateUserDeviceDonation,
  deleteUserDeviceDonation,
  getAllDeviceDonationsForAdmin,
  updateDeviceDonationStatus,
  getDeviceDonationStats
};
