const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModels");
const { hashPassword, comparePassword } = require("../utils/auth");

// GET all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const filter = {};
    if (role) filter.userRole = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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
      currentPage: parseInt(page),
      total
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
 
// POST create user
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      contact,
      userRole,
      categoryType,
      isOrganization,
      about,
      profession,
      linkedIn,
      instagram,
      facebook,
      address,
      emailUpdates,
      document
    } = req.body;
    
    console.log(" req.body", req.body);
    
    // Handle document information
    let documentInfo = {};
    if (document) {
      try {
        const docData = typeof document === 'string' ? JSON.parse(document) : document;
        documentInfo = {
          filename: docData.name || '',
          originalName: docData.name || '',
          mimetype: docData.type || '',
          size: docData.size || 0,
          uploadDate: new Date()
        };
      } catch (error) {
        console.log("Document parsing error:", error);
        documentInfo = {
          filename: '',
          originalName: '',
          mimetype: '',
          size: 0,
          uploadDate: new Date()
        };
      }
    }
    
    // const existing = await UserModel.findOne({ email });
    // if (existing) {
    //   return res.status(400).json({ error: "Email already exists" });
    // }

    // Hash the password using bcrypt utility function
    const hashedPassword = await hashPassword(password);

    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword, // Save hashed password instead of plain text
      contact,
      userRole,
      categoryType,
      isOrganization,
      about,
      profession,
      linkedIn,
      instagram,
      facebook,
      address,
      emailUpdates: emailUpdates !== undefined ? emailUpdates : true,
      document: documentInfo
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
};

// Admin: Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Admin: Update user
const updateUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      userRole,
      categoryType,
      isOrganization,
      about,
      profession,
      linkedIn,
      instagram,
      facebook,
      address,
      emailUpdates,
      isActive
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (contact !== undefined) updates.contact = contact;
    if (userRole !== undefined) updates.userRole = userRole;
    if (categoryType !== undefined) updates.categoryType = categoryType;
    if (isOrganization !== undefined) updates.isOrganization = isOrganization;
    if (about !== undefined) updates.about = about;
    if (profession !== undefined) updates.profession = profession;
    if (linkedIn !== undefined) updates.linkedIn = linkedIn;
    if (instagram !== undefined) updates.instagram = instagram;
    if (facebook !== undefined) updates.facebook = facebook;
    if (address !== undefined) updates.address = address;
    if (emailUpdates !== undefined) updates.emailUpdates = emailUpdates;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (err) {
    console.error('Update user by admin error:', err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Admin: Delete user
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error('Delete user by admin error:', err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Admin: Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await UserModel.aggregate([
      {
        $group: {
          _id: '$userRole',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ isActive: true });
    const inactiveUsers = await UserModel.countDocuments({ isActive: false });

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      breakdown: stats
    });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ error: "Failed to get user statistics" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password, userRole } = req.body;
    console.log("Login attempt for email:", email, "role:", userRole);
    
    // Find user by email
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    console.log("User found:", user.email, "stored password type:", typeof user.password, "length:", user.password?.length);
    
    // Check if password is already hashed (bcrypt hashes start with $2b$)
    let isPasswordValid = false;
    if (user.password && user.password.startsWith('$2b$')) {
      // Password is hashed, use bcrypt compare
      console.log("Using bcrypt compare for hashed password");
      isPasswordValid = await comparePassword(password, user.password);
    } else {
      // Password is plain text, do direct comparison (for existing users)
      console.log("Using direct comparison for plain text password");
      isPasswordValid = (user.password === password);
    }
    
    if (!isPasswordValid) {
      console.log("Password validation failed");
      return res.status(401).json({ error: "Invalid email or password" });
    }    
    // Validate user role if specified
    if (userRole) {
      if (user.userRole !== userRole) {
        return res.status(403).json({ 
          error: "Role mismatch", 
          message: `You are registered as a ${user.userRole}, not a ${userRole}. Please select the correct role.`,
          actualRole: user.userRole
        });
      }
    }
    
    // For admin login, ensure the user is actually an admin
    if (userRole === 'admin' && user.userRole !== 'admin') {
      return res.status(403).json({ 
        error: "Access denied", 
        message: "Only admin users can access the admin panel.",
        actualRole: user.userRole
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.userRole },
      process.env.JWT_SECRET || 'yantraDaan2024SuperSecretKeyForJWTTokenGeneration',
      { expiresIn: '7d' }
    );
    
    // Return user data with token
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
        userRole: user.userRole,
        categoryType: user.categoryType,
        isOrganization: user.isOrganization,
        address: user.address,
        emailUpdates: user.emailUpdates,
        linkedIn: user.linkedIn,
        instagram: user.facebook,
        emailUpdates: user.emailUpdates,
        document: user.document,
        profilePhoto: user.profilePhoto
      },
      token
    });
    
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const user = await UserModel.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      message: "Profile retrieved successfully",
      user
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    console.log("Updating profile for user ID:", userId);
    console.log("Request body:", req.body);
    
    const {
      name,
      contact,
      about,
      profession,
      linkedIn,
      instagram,
      facebook,
      address,
      emailUpdates
    } = req.body;
    
    const updates = {};
    
    // Always update fields that are provided
    if (name !== undefined) updates.name = name;
    if (contact !== undefined) updates.contact = contact;
    if (about !== undefined) updates.about = about;
    if (profession !== undefined) updates.profession = profession;
    if (linkedIn !== undefined) updates.linkedIn = linkedIn;
    if (instagram !== undefined) updates.instagram = instagram;
    if (facebook !== undefined) updates.facebook = facebook;
    if (address !== undefined) updates.address = address;
    if (emailUpdates !== undefined) updates.emailUpdates = emailUpdates;
    
    // Provide default values for required fields if they're empty or missing
    if (!updates.about || updates.about.trim() === '') updates.about = "Not specified";
    if (!updates.profession || updates.profession.trim() === '') updates.profession = "Not specified";
    if (!updates.address || updates.address.trim() === '') updates.address = "Not specified";
    
    console.log("Updates to apply:", updates);
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("User updated successfully:", updatedUser);
    
    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
    
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id || req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    console.log("Uploading profile photo for user ID:", userId);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    
    // Check if file was uploaded
    if (!req.files || !req.files.profilePhoto) {
      return res.status(400).json({ error: "Profile photo file is required" });
    }
    
    const uploadedFile = req.files.profilePhoto;
    console.log("Uploaded file:", uploadedFile);
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = uploadedFile.name.split('.').pop();
    const filename = `profile_${userId}_${timestamp}.${fileExtension}`;
    
    // Move file to uploads directory
    const uploadPath = `./uploads/${filename}`;
    
    // Ensure uploads directory exists
    const fs = require('fs');
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    
    await uploadedFile.mv(uploadPath);
    console.log("File saved to:", uploadPath);
    
    // Update user profile with photo info
    const photoInfo = {
      filename: filename,
      originalName: uploadedFile.name,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      uploadDate: new Date()
    };
    
    console.log("Photo info to save:", photoInfo);
    
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePhoto: photoInfo },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("User updated successfully with photo:", updatedUser);
    
    res.json({
      message: "Profile photo updated successfully",
      user: updatedUser,
      photoInfo: photoInfo
    });
    
  } catch (err) {
    console.error("Upload profile photo error:", err);
    res.status(500).json({ error: "Failed to upload profile photo" });
  }
};

module.exports = { 
  getAllUsers, 
  getUserById,
  createUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  updateUserByAdmin,
  deleteUserByAdmin,
  getUserStats,
  uploadProfilePhoto 
};
