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
        profilePhoto: user.profilePhoto,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        verificationDocuments: user.verificationDocuments,
        verificationNotes: user.verificationNotes,
        verifiedAt: user.verifiedAt,
        verifiedBy: user.verifiedBy,
        verificationFormData: user.verificationFormData
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
    console.log("Request file:", req.file);
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile photo file is required" });
    }
    
    console.log("Uploaded file:", req.file);
    
    // Update user profile with photo info
    const photoInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
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

// Upload verification document
const uploadVerificationDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Uploading verification document for user ID:", userId);
    console.log("Request file:", req.file);
    console.log("Document type:", req.body.type);

    if (!req.file) {
      return res.status(400).json({ error: "Verification document file is required" });
    }

    if (!req.body.type) {
      return res.status(400).json({ error: "Document type is required" });
    }

    const allowedTypes = ['id_proof', 'address_proof', 'income_proof', 'education_proof', 'other'];
    if (!allowedTypes.includes(req.body.type)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    const documentInfo = {
      type: req.body.type,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date()
    };

    // Add document to user's verification documents array
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has a document of this type
    const existingDocIndex = user.verificationDocuments.findIndex(doc => doc.type === req.body.type);
    
    if (existingDocIndex >= 0) {
      // Replace existing document
      user.verificationDocuments[existingDocIndex] = documentInfo;
    } else {
      // Add new document
      user.verificationDocuments.push(documentInfo);
    }

    await user.save();

    console.log("Verification document uploaded successfully:", documentInfo);

    res.json({
      message: "Verification document uploaded successfully",
      document: documentInfo
    });

  } catch (err) {
    console.error("Upload verification document error:", err);
    res.status(500).json({ error: "Failed to upload verification document" });
  }
};

// Submit verification request
const submitVerification = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { documents, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Submitting verification request for user ID:", userId);
    console.log("Documents:", documents);
    console.log("Notes:", notes);

    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: "At least one verification document is required" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse the notes to extract the answers
    let howDeviceHelps = '';
    let whyNeedDevice = '';
    
    if (notes) {
      const lines = notes.split('\n');
      for (const line of lines) {
        if (line.startsWith('How can this device help me:')) {
          howDeviceHelps = line.replace('How can this device help me:', '').trim();
        } else if (line.startsWith('Why do I need a device:')) {
          whyNeedDevice = line.replace('Why do I need a device:', '').trim();
        }
      }
    }

    // Update user verification status to pending and save form data
    user.verificationStatus = 'pending';
    user.verificationNotes = notes || '';
    user.verificationDocuments = documents;
    user.verificationFormData = {
      howDeviceHelps,
      whyNeedDevice,
      submittedAt: new Date()
    };

    await user.save();

    console.log("Verification request submitted successfully for user:", userId);
    console.log("Form data saved:", user.verificationFormData);

    res.json({
      message: "Verification request submitted successfully. We'll review it within 2-3 business days.",
      verificationStatus: user.verificationStatus
    });

  } catch (err) {
    console.error("Submit verification error:", err);
    res.status(500).json({ error: "Failed to submit verification request" });
  }
};

// Admin: Update verification status
const updateVerificationStatus = async (req, res) => {
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
};

// Get unverified users for admin
const getUnverifiedUsers = async (req, res) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: "Admin authentication required" });
    }

    console.log("Fetching unverified users for admin:", adminId);

    // Find users with pending verification status
    const unverifiedUsers = await UserModel.find({
      verificationStatus: 'pending'
    })
    .select('-password')
    .sort({ 'verificationFormData.submittedAt': -1 });

    console.log("Found unverified users:", unverifiedUsers.length);

    res.json({
      users: unverifiedUsers,
      total: unverifiedUsers.length
    });

  } catch (err) {
    console.error("Get unverified users error:", err);
    res.status(500).json({ error: "Failed to get unverified users" });
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
  uploadProfilePhoto,
  uploadVerificationDocument,
  submitVerification,
  updateVerificationStatus,
  getUnverifiedUsers
};
