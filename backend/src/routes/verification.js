const { Router } = require('express');
const UserModel = require('../models/UserModels');
const { auth, requireRole } = require('../middleware/auth');

const router = Router();

// Get all users for verification with pagination and filters
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
        { about: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.verificationStatus = status;
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
    console.error('Error fetching verification users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user verification status
router.put('/users/:userId/status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    const allowedStatuses = ['unverified', 'pending', 'verified', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid verification status" });
    }

    console.log("Updating verification status for user:", userId, "to:", status);

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update verification status
    user.verificationStatus = status;
    user.verificationNotes = notes || '';
    user.isVerified = (status === 'verified');
    
    if (status === 'verified') {
      user.verifiedAt = new Date();
      user.verifiedBy = adminId;
      
      // If user needs to set up password, send password setup email
      if (user.passwordSetupRequired) {
        try {
          const { sendEmail, emailTemplates } = require('../utils/emailService');
          const crypto = require('crypto');
          
          // Generate password setup token
          const token = crypto.randomBytes(32).toString('hex');
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          
          user.passwordSetupToken = token;
          user.passwordSetupExpires = expires;
          
          // Send password setup email
          const emailData = {
            to: user.email,
            subject: 'Set Up Your Password - Yantra Daan',
            html: emailTemplates.welcomeNewRequester(user, token)
          };
          
          await sendEmail(emailData);
          console.log(`Password setup email sent to: ${user.email}`);
        } catch (emailError) {
          console.error('Failed to send password setup email:', emailError);
          // Don't fail the verification if email fails
        }
      }
    } else {
      user.verifiedAt = null;
      user.verifiedBy = null;
    }

    await user.save();

    console.log("Verification status updated successfully for user:", userId);

    res.json({
      message: `User verification status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified,
        verificationNotes: user.verificationNotes,
        verifiedAt: user.verifiedAt
      }
    });

  } catch (err) {
    console.error("Update verification status error:", err);
    res.status(500).json({ error: "Failed to update verification status" });
  }
});

// Get verification statistics
router.get('/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const unverifiedUsers = await UserModel.countDocuments({ verificationStatus: 'unverified' });
    const pendingUsers = await UserModel.countDocuments({ verificationStatus: 'pending' });
    const verifiedUsers = await UserModel.countDocuments({ verificationStatus: 'verified' });
    const rejectedUsers = await UserModel.countDocuments({ verificationStatus: 'rejected' });

    res.json({
      totalUsers,
      unverifiedUsers,
      pendingUsers,
      verifiedUsers,
      rejectedUsers
    });
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    res.status(500).json({ error: 'Failed to fetch verification statistics' });
  }
});

module.exports = router;
