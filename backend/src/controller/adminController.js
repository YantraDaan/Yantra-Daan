const AdminModel = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create new admin account (no validation)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        error: 'Admin with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = new AdminModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    });

    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'yantraDaan2024SuperSecretKeyForJWTTokenGeneration',
      { expiresIn: '7d' }
    );

    // Return admin data (without password) and token
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      message: 'Admin account created successfully',
      admin: adminResponse,
      token
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      error: 'Failed to create admin account',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Admin login (no validation)
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await AdminModel.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        error: 'Admin account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'yantraDaan2024SuperSecretKeyForJWTTokenGeneration',
      { expiresIn: '7d' }
    );

    // Return admin data (without password) and token
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.json({
      message: 'Admin login successful',
      admin: adminResponse,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Failed to login',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      admins,
      total: admins.length
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      error: 'Failed to get admins',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.params.id)
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    res.json(admin);

  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({
      error: 'Failed to get admin',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { name, email, role, isActive, permissions } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (permissions !== undefined) updates.permissions = permissions;

    const admin = await AdminModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    res.json({
      message: 'Admin updated successfully',
      admin
    });

  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      error: 'Failed to update admin',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Change admin password
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await AdminModel.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    admin.password = hashedNewPassword;
    await admin.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    res.json({
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      error: 'Failed to delete admin',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.admin.adminId)
      .select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    res.json(admin);

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      error: 'Failed to get admin profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update admin profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();

    const admin = await AdminModel.findByIdAndUpdate(
      req.admin.adminId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        error: 'Admin not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      admin
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Bulk create admins (for testing/development)
const bulkCreateAdmins = async (req, res) => {
  try {
    const { admins } = req.body; // Array of admin objects

    if (!Array.isArray(admins) || admins.length === 0) {
      return res.status(400).json({
        error: 'Admins array is required and must not be empty'
      });
    }

    const createdAdmins = [];
    const errors = [];

    for (const adminData of admins) {
      try {
        const { name, email, password, role = 'admin' } = adminData;

        // Check if admin already exists
        const existingAdmin = await AdminModel.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
          errors.push(`Admin with email ${email} already exists`);
          continue;
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create admin
        const admin = new AdminModel({
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role
        });

        await admin.save();

        const adminResponse = admin.toObject();
        delete adminResponse.password;
        createdAdmins.push(adminResponse);

      } catch (error) {
        errors.push(`Failed to create admin ${adminData.email}: ${error.message}`);
      }
    }

    res.json({
      message: `Successfully created ${createdAdmins.length} admin(s)`,
      createdAdmins,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk create admins error:', error);
    res.status(500).json({
      error: 'Failed to bulk create admins',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createAdmin,
  adminLogin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  changeAdminPassword,
  deleteAdmin,
  getAdminProfile,
  updateAdminProfile,
  bulkCreateAdmins
};
