const { Router } = require('express');
const UserModel = require('../models/UserModels');
const PasswordResetTokenModel = require('../models/PasswordResetToken');
const { auth, requireRole } = require('../middleware/auth');
const { profileUpload, verificationUpload } = require('../middleware/imageUpload');
const { 
  getAllUsers, 
  getUserById,
  createUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  updateUserByAdmin,
  deleteUserByAdmin,
  getUserStats,
  uploadProfilePhoto,
  uploadVerificationDocument,
  submitVerification,
  updateVerificationStatus,
  getUnverifiedUsers
} = require("../controller/usersController");

const router = Router();

// Public routes
router.post("/", createUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.get("/me", auth, getUserProfile);
router.put("/me", auth, updateUserProfile);
router.post("/upload-photo", auth, profileUpload.single('profilePhoto'), uploadProfilePhoto);

// Admin routes (require admin role)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, category, search } = req.query;
    
    const filter = {};
    if (role && role !== 'all') filter.userRole = role;
    if (category && category !== 'all') filter.categoryType = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserModel.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user by ID (admin only)
router.put('/:id',  async (req, res) => {
  try {
    const { name, email, userRole, contact, categoryType, isOrganization, about, profession, address } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (userRole !== undefined) updates.userRole = userRole;
    if (contact !== undefined) updates.contact = contact;
    if (categoryType !== undefined) updates.categoryType = categoryType;
    if (isOrganization !== undefined) updates.isOrganization = isOrganization;
    if (about !== undefined) updates.about = about;
    if (profession !== undefined) updates.profession = profession;
    if (address !== undefined) updates.address = address;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete user by ID (admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Also delete any associated password reset tokens
    await PasswordResetTokenModel.deleteMany({ userId: req.params.id });

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user statistics (admin only)
router.get('/admin/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await UserModel.aggregate([
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

    const roleStats = await UserModel.aggregate([
      {
        $group: {
          _id: "$userRole",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const categoryStats = await UserModel.aggregate([
      {
        $group: {
          _id: "$categoryType",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ lastLogin: { $gte: startDate } });

    res.json({
      totalUsers,
      activeUsers,
      monthlyStats: stats,
      roleStats,
      categoryStats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Failed to get user statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user profile (authenticated user)
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const {
      name,
      contact,
      address,
      about,
      profession,
      linkedIn,
      instagram,
      facebook,
      emailUpdates
    } = req.body;
    
    const updates = {};
    
    // Always update fields that are provided
    if (name !== undefined) updates.name = name;
    if (contact !== undefined) updates.contact = contact;
    if (address !== undefined) updates.address = address;
    if (about !== undefined) updates.about = about;
    if (profession !== undefined) updates.profession = profession;
    if (linkedIn !== undefined) updates.linkedIn = linkedIn;
    if (instagram !== undefined) updates.instagram = instagram;
    if (facebook !== undefined) updates.facebook = facebook;
    if (emailUpdates !== undefined) updates.emailUpdates = emailUpdates;
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Upload profile photo
router.post("/upload-photo", auth, profileUpload.single('profilePhoto'), uploadProfilePhoto);

// Verification routes
router.post("/upload-verification-document", auth, verificationUpload.single('document'), uploadVerificationDocument);
router.post("/submit-verification", auth, submitVerification);

// Admin verification routes
router.put("/:userId/verification-status", auth, requireRole(['admin']), updateVerificationStatus);
router.get("/unverified", auth, requireRole(['admin']), getUnverifiedUsers);

module.exports = router;


