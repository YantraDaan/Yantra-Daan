const { Router } = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { validateDevicePost } = require('../middleware/validation');
const DeviceModel = require('../models/Device');
const UserModel = require('../models/UserModels');
const DeviceRequestModel = require('../models/DeviceRequest');
const {
  createDeviceDonation,
  getApprovedDeviceDonations,
  getDeviceDonationById,
  getUserDeviceDonations,
  updateUserDeviceDonation,
  deleteUserDeviceDonation,
  getAllDeviceDonationsForAdmin,
  updateDeviceDonationStatus,
  getDeviceDonationStats
} = require('../controller/deviceDonationController');

const router = Router();

// Public routes (no authentication required)
router.get('/approved', getApprovedDeviceDonations);
router.get('/stats', getDeviceDonationStats);

// Protected routes (require authentication)
router.post('/', auth, createDeviceDonation);
router.get('/my', auth, getUserDeviceDonations);
router.get('/my/:id', auth, getDeviceDonationById);
router.put('/my/:id', auth, updateUserDeviceDonation);
router.delete('/my/:id', auth, deleteUserDeviceDonation);

// Admin routes (require admin role)
router.get('/admin/all', auth, requireRole(['admin']), getAllDeviceDonationsForAdmin);
router.put('/admin/:id/status', auth, requireRole(['admin']), updateDeviceDonationStatus);

// Get recent donations (public)
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const donations = await DeviceModel.find({ status: 'approved' })
      .populate('ownerInfo', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ donations });
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({
      error: 'Failed to get recent donations',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Enhanced stats endpoint with comprehensive data
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get basic counts
    const totalDevices = await DeviceModel.countDocuments();
    const pendingDevices = await DeviceModel.countDocuments({ status: 'pending' });
    const approvedDevices = await DeviceModel.countDocuments({ status: 'approved' });
    const rejectedDevices = await DeviceModel.countDocuments({ status: 'rejected' });
    const totalUsers = await UserModel.countDocuments();
    const totalDonations = totalDevices;
    const totalRequests = await DeviceRequestModel.countDocuments();

    // Get monthly statistics
    const monthlyStats = await DeviceModel.aggregate([
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
          devices: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get device type statistics
    const deviceTypeStats = await DeviceModel.aggregate([
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $multiply: [
              { $divide: ["$count", totalDevices] },
              100
            ]
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get user role statistics
    const userRoleStats = await UserModel.aggregate([
      {
        $group: {
          _id: "$userRole",
          count: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: {
            $multiply: [
              { $divide: ["$count", totalUsers] },
              100
            ]
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get recent activity
    const recentActivity = await DeviceModel.aggregate([
      {
        $sort: { updatedAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'ownerInfo'
        }
      },
      {
        $unwind: '$ownerInfo'
      },
      {
        $project: {
          id: '$_id',
          type: 'device',
          description: {
            $concat: [
              '$title',
              ' by ',
              '$ownerInfo.name'
            ]
          },
          timestamp: '$updatedAt',
          status: '$status'
        }
      }
    ]);

    // Add user registrations to recent activity
    const recentUsers = await UserModel.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          id: '$_id',
          type: 'user',
          description: {
            $concat: [
              'New user: ',
              '$name',
              ' (',
              '$userRole',
              ')'
            ]
          },
          timestamp: '$createdAt',
          status: 'active'
        }
      }
    ]);

    // Combine and sort recent activity
    const allRecentActivity = [...recentActivity, ...recentUsers]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      totalUsers,
      totalDevices,
      totalDonations,
      totalRequests,
      pendingDevices,
      approvedDevices,
      rejectedDevices,
      monthlyStats,
      deviceTypeStats,
      userRoleStats,
      recentActivity: allRecentActivity
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
