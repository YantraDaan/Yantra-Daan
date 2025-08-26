const { Router } = require('express');
const UserModel = require('../models/UserModels');
const PasswordResetTokenModel = require('../models/PasswordResetToken');
const { auth } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validatePasswordReset, 
  validateNewPassword 
} = require('../middleware/validation');
const { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  generateResetToken, 
  hashResetToken, 
  compareResetToken 
} = require('../utils/auth');
const emailService = require('../utils/emailService');

const router = Router();

// Check if email exists before registration
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (existingUser) {
      return res.json({ 
        exists: true,
        message: 'Email already registered. Please login instead.',
        redirectTo: 'login'
      });
    } else {
      return res.json({ 
        exists: false,
        message: 'Email is available. You can proceed with registration.',
        redirectTo: 'register'
      });
    }

  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ 
      error: 'Failed to check email',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password, userRole, contact, categoryType, isOrganization, about, profession, address } = req.body;

    // Check if user already exists (case-insensitive)
    const existingUser = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = new UserModel({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      userRole: userRole || 'donor',
      contact,
      categoryType,
      isOrganization,
      about,
      profession,
      address
    });

    await user.save();

    // Send welcome email to the user
    try {
      const welcomeEmailData = {
        to: user.email,
        subject: `Welcome to YantraDaan, ${user.name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to YantraDaan!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your account has been created successfully</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${user.name},</h2>
              
              <p style="color: #555; line-height: 1.6;">
                Thank you for joining YantraDaan! We're excited to have you as part of our community dedicated to bridging the digital divide.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Account Details:</h3>
                <ul style="color: #555; line-height: 1.6; margin: 10px 0;">
                  <li><strong>Name:</strong> ${user.name}</li>
                  <li><strong>Email:</strong> ${user.email}</li>
                  <li><strong>Role:</strong> ${user.userRole}</li>
                  <li><strong>Account Type:</strong> ${user.isOrganization ? 'Organization' : 'Individual'}</li>
                  ${user.categoryType ? `<li><strong>Category:</strong> ${user.categoryType}</li>` : ''}
                </ul>
              </div>
              
              <p style="color: #555; line-height: 1.6;">
                You can now:
              </p>
              <ul style="color: #555; line-height: 1.6;">
                ${user.userRole === 'donor' ? '<li>Donate your devices to help others</li>' : ''}
                ${user.userRole === 'requester' ? '<li>Request devices you need</li>' : ''}
                ${user.userRole === 'admin' ? '<li>Access the admin panel</li>' : ''}
                <li>Update your profile and preferences</li>
                <li>Connect with our community</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Get Started
                </a>
              </div>
              
              <p style="color: #555; line-height: 1.6;">
                If you have any questions or need assistance, feel free to reach out to our support team.
              </p>
              
              <p style="color: #555; line-height: 1.6;">
                Best regards,<br>
                The YantraDaan Team
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
              <p>This email was sent to ${user.email}</p>
              <p>© 2024 YantraDaan. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await emailService.sendEmail(welcomeEmailData);
      console.log(`Welcome email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login user with role validation
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password, userRole } = req.body;

    console.log('=== LOGIN ATTEMPT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Extracted values:', { email, userRole, passwordLength: password?.length });
    console.log('Request headers:', req.headers);

    // Find user by email (case-insensitive)
    const user = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (!user) {
      console.log('User not found for email:', email);
      console.log('Database query used:', { email: { $regex: new RegExp(`^${email}$`, 'i') } });
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    console.log('User found:', { 
      _id: user._id,
      email: user.email, 
      userRole: user.userRole, 
      passwordLength: user.password?.length,
      passwordType: typeof user.password,
      passwordPreview: user.password ? `${user.password.substring(0, 10)}...` : 'undefined'
    });

    // Check password - handle both hashed and plain text passwords
    let isPasswordValid = false;
    
    // First try to compare with hashed password
    if (user.password && user.password.length > 20) {
      console.log('Attempting hashed password comparison');
      // Password appears to be hashed (bcrypt hashes are long)
      isPasswordValid = await comparePassword(password, user.password);
      console.log('Hashed password comparison result:', isPasswordValid);
    } else {
      console.log('Attempting plain text password comparison');
      // Password appears to be plain text (for existing users)
      isPasswordValid = (user.password === password);
      console.log('Plain text password comparison result:', isPasswordValid);
      console.log('Stored password:', user.password);
      console.log('Input password:', password);
      
      // If login successful with plain text, hash the password for future use
      if (isPasswordValid) {
        try {
          const hashedPassword = await hashPassword(password);
          await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
          console.log(`Updated password for user ${user.email} from plain text to hash`);
        } catch (hashError) {
          console.error('Error hashing password during login:', hashError);
          // Continue with login even if hashing fails
        }
      }
    }

    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log('User account is inactive:', user.email);
      return res.status(403).json({ 
        error: 'Your user account is inactive now. Please contact administrator.',
        message: 'Account deactivated'
      });
    }

    // For admin login, validate userRole
    if (userRole === 'admin') {
      if (user.userRole !== 'admin') {
        console.log('Admin role validation failed:', { requestedRole: userRole, actualRole: user.userRole });
        return res.status(403).json({ 
          error: 'Access denied. Admin privileges required.',
          message: 'This account does not have admin privileges.'
        });
      }
      console.log('Admin role validation passed');
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Login successful for user:', user.email);

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Failed to login',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get profile'
    });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, contact, address, about } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (contact !== undefined) updates.contact = contact;
    if (address !== undefined) updates.address = address;
    if (about !== undefined) updates.about = about;

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

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

// Forgot password
router.post('/forgot-password', validatePasswordReset, async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email (case-insensitive)
    const user = await UserModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = await hashResetToken(resetToken);

    // Save reset token
    await PasswordResetTokenModel.create({
      userId: user._id,
      token: hashedToken
    });

    // In production, send email here
    // For now, just return the token (remove this in production)
    if (process.env.NODE_ENV === 'development') {
      res.json({
        message: 'Password reset token generated',
        resetToken, // Remove this in production
        message: 'Password reset link sent to your email'
      });
    } else {
      res.json({
        message: 'Password reset link sent to your email'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      error: 'Failed to process password reset request',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Reset password
router.post('/reset-password', validateNewPassword, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ 
        error: 'Reset token is required' 
      });
    }

    // Find valid reset token
    const resetTokenDoc = await PasswordResetTokenModel.findOne({
      token: { $exists: true }
    });

    if (!resetTokenDoc) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Verify token
    const isValidToken = await compareResetToken(token, resetTokenDoc.token);
    if (!isValidToken) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Update password
    const newPasswordHash = await hashPassword(password);
    await UserModel.findByIdAndUpdate(resetTokenDoc.userId, {
      password: newPasswordHash
    });

    // Delete used reset token
    await PasswordResetTokenModel.findByIdAndDelete(resetTokenDoc._id);

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Change password (authenticated user)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'New password must be at least 8 characters long' 
      });
    }

    // Get user with password hash
    const user = await UserModel.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await UserModel.findByIdAndUpdate(req.user._id, {
      password: newPasswordHash
    });

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
});

// Test email endpoint (for development/testing)
router.post('/test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({
        error: 'to, subject, and message are required'
      });
    }

    const testEmailData = {
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 24px;">🧪 Test Email</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Test Message</h2>
            <p style="color: #555; line-height: 1.6;">${message}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Email Details:</h3>
              <ul style="color: #555; line-height: 1.6; margin: 10px 0;">
                <li><strong>To:</strong> ${to}</li>
                <li><strong>Subject:</strong> ${subject}</li>
                <li><strong>Sent At:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              This is a test email to verify the email service is working correctly.
            </p>
          </div>
        </div>
      `
    };

    await emailService.sendEmail(testEmailData);
    
    res.json({
      message: 'Test email sent successfully',
      to,
      subject,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

module.exports = router;
