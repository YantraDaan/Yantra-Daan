const { Router } = require('express');
const UserModel = require('../models/UserModels');
const PasswordResetTokenModel = require('../models/PasswordResetToken');
const { auth, requireRole } = require('../middleware/auth');
const { 
  validateRegistration, 
  validateLogin, 
  validateAdminLogin,
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
const { notifyNewUserCreated } = require('../utils/emailService');

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

    // Check if user already exists (use email as provided)
    const existingUser = await UserModel.findOne({ 
      email: email // Use email as provided without regex modification
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

    // Check if user already exists (case-insensitive but preserving dots)
    const existingUser = await UserModel.findOne({ 
      email: email // Use email as-is after validation
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Determine if password is required based on user role
    const isAdmin = userRole === 'admin';
    let passwordHash = null;
    let passwordSetupRequired = false;

    if (isAdmin) {
      // Admin users must have password
      if (!password) {
        return res.status(400).json({ 
          error: 'Password is required for admin users' 
        });
      }
      passwordHash = await hashPassword(password);
    } else {
      // Donors and requesters don't need password initially
      passwordSetupRequired = true;
    }

    // Create user (preserve email format from validation)
    const user = new UserModel({
      name,
      email, // Use email as validated (with dots preserved)
      password: passwordHash,
      passwordSetupRequired,
      // Note: passwordSetupExpires will be set when generating the token
      userRole: userRole || 'donor',
      contact,
      categoryType,
      isOrganization,
      about,
      profession,
      address
    });

    await user.save();

    // Send appropriate email based on user type
    try {
      if (passwordSetupRequired) {
        // Generate password setup token for donors and requesters
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        user.passwordSetupToken = token;
        user.passwordSetupExpires = expires;
        await user.save();

        // Send password setup email
        const { sendEmail, emailTemplates } = require('../utils/emailService');
        const passwordSetupEmailData = {
          to: user.email,
          subject: 'Welcome to Yantra Daan - Requester Account Created',
          html: emailTemplates.welcomeNewRequester(user, token)
        };
        
        await sendEmail(passwordSetupEmailData);
        console.log(`Password setup email sent to: ${user.email}`);
      }
      // For admin users, the welcome email will be sent by notifyNewUserCreated function
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail registration if email fails
    }

    // Send email notifications to user and admins
    try {
      await notifyNewUserCreated(user);
      console.log(`New user notification sent for: ${user.name} (${user.userRole})`);
    } catch (emailError) {
      console.error('Failed to send new user notifications:', emailError);
      // Don't fail registration if email fails
    }

    // Generate token only if user has password (admin users)
    let token = null;
    if (!passwordSetupRequired) {
      token = generateToken(user._id);
    }

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: passwordSetupRequired 
        ? 'User registered successfully. Please check your email for password setup instructions.'
        : 'User registered successfully',
      user: userResponse,
      token,
      passwordSetupRequired
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin login with strict validation - ONLY for admin users
router.post('/admin-login', validateAdminLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('=== ADMIN LOGIN ATTEMPT DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Extracted values:', { email, passwordLength: password?.length });

    // Find user by email (use validated email format)
    const user = await UserModel.findOne({ 
      email: email // Use email as validated
    });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    console.log('User found:', { 
      _id: user._id,
      email: user.email, 
      userRole: user.userRole, 
      passwordLength: user.password?.length
    });

    // STRICT: Only allow admin users to login through admin endpoint
    if (user.userRole !== 'admin') {
      console.log('Admin login rejected - user is not admin:', { email, userRole: user.userRole });
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        message: 'This account does not have admin privileges. Only admin users can use this login endpoint.'
      });
    }

    // Check password - handle both hashed and plain text passwords
    let isPasswordValid = false;
    
    if (user.password && user.password.length > 20) {
      console.log('Attempting hashed password comparison');
      isPasswordValid = await comparePassword(password, user.password);
      console.log('Hashed password comparison result:', isPasswordValid);
    } else {
      console.log('Attempting plain text password comparison');
      isPasswordValid = (user.password === password);
      console.log('Plain text password comparison result:', isPasswordValid);
      
      // If login successful with plain text, hash the password for future use
      if (isPasswordValid) {
        try {
          const hashedPassword = await hashPassword(password);
          await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });
          console.log(`Updated password for user ${user.email} from plain text to hash`);
        } catch (hashError) {
          console.error('Error hashing password during admin login:', hashError);
        }
      }
    }

    if (!isPasswordValid) {
      console.log('Admin password validation failed');
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log('Admin account is inactive:', user.email);
      return res.status(403).json({ 
        error: 'Your admin account is inactive. Please contact administrator.',
        message: 'Account deactivated'
      });
    }

    console.log('Admin login validation passed');

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Admin login successful for user:', user.email);

    res.json({
      message: 'Admin login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Failed to login as admin',
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

    // Find user by email (use validated email format)
    const user = await UserModel.findOne({ 
      email: email // Use email as validated
    });

    if (!user) {
      console.log('User not found for email:', email);
      console.log('Database query used:', { email: email });
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

// Validate JWT token
router.get('/validate', auth, async (req, res) => {
  try {
    // If we reach here, the token is valid (auth middleware passed)
    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token validation error:', error.message);
    res.status(401).json({ 
      valid: false,
      error: 'Invalid token'
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
    const { name, contact, address, about, profession, linkedIn, instagram, facebook, emailUpdates } = req.body;
    const updates = {};

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

    // Find user by email (use validated email format)
    const user = await UserModel.findOne({ 
      email: email // Use email as validated
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

    // Set token expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save reset token
    await PasswordResetTokenModel.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: expiresAt
    });

    // Send password reset email
    try {
      const { sendEmail, emailTemplates } = require('../utils/emailService');
      
      const emailData = {
        to: user.email,
        subject: 'Password Reset Request - Yantra Daan',
        html: emailTemplates.passwordReset(user, resetToken)
      };
      
      await sendEmail(emailData);
      console.log(`Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.json({
      message: 'Password reset link sent to your email'
    });

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

    // Find all reset tokens that haven't expired
    const resetTokenDocs = await PasswordResetTokenModel.find({
      expiresAt: { $gt: Date.now() }
    });

    if (!resetTokenDocs || resetTokenDocs.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Find the correct token by comparing with each one
    let resetTokenDoc = null;
    let isValidToken = false;
    
    for (const doc of resetTokenDocs) {
      const isValid = await compareResetToken(token, doc.token);
      if (isValid) {
        resetTokenDoc = doc;
        isValidToken = true;
        break;
      }
    }

    if (!isValidToken || !resetTokenDoc) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Get user
    const user = await UserModel.findById(resetTokenDoc.userId);
    if (!user) {
      return res.status(400).json({ 
        error: 'User not found' 
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

// Password setup for users who registered without password
router.post('/setup-password', async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password || !token) {
      return res.status(400).json({ 
        error: 'Email, password, and token are required' 
      });
    }

    // Find user by email and verify token (use email as provided)
    const user = await UserModel.findOne({ 
      email: email, // Use email as provided
      passwordSetupToken: token,
      passwordSetupExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired password setup token' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      });
    }

    // Hash password and update user
    const passwordHash = await hashPassword(password);
    
    user.password = passwordHash;
    user.passwordSetupRequired = false;
    user.passwordSetupToken = null;
    user.passwordSetupExpires = null;
    
    await user.save();

    // Generate token for immediate login
    const authToken = generateToken(user._id);

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Password set successfully',
      user: userResponse,
      token: authToken
    });

  } catch (error) {
    console.error('Password setup error:', error);
    res.status(500).json({ 
      error: 'Failed to set password',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate password setup token
router.post('/generate-password-token', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ 
      email: email.toLowerCase(),
      passwordSetupRequired: true
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found or password already set' 
      });
    }

    // Generate token and expiration
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.passwordSetupToken = token;
    user.passwordSetupExpires = expires;
    await user.save();

    // Send password setup email
    try {
      const { sendEmail, emailTemplates } = require('../utils/emailService');
      
      const emailData = {
        to: user.email,
        subject: 'Welcome to Yantra Daan - Requester Account Created',
        html: emailTemplates.welcomeNewRequester(user, token)
      };
      
      await sendEmail(emailData);
      console.log(`Password setup email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password setup email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Password setup token generated and email sent',
      token // Include token in response for testing
    });

  } catch (error) {
    console.error('Generate password token error:', error);
    res.status(500).json({ 
      error: 'Failed to generate password setup token',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin endpoint to send password setup email to existing users
router.post('/admin/send-password-setup', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email (use email as provided)
    const user = await UserModel.findOne({ 
      email: email // Use email as provided
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Check if user already has a password
    if (user.password && !user.passwordSetupRequired) {
      return res.status(400).json({ 
        error: 'User already has a password set up' 
      });
    }

    // Generate token and expiration
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.passwordSetupToken = token;
    user.passwordSetupExpires = expires;
    user.passwordSetupRequired = true;
    await user.save();

    // Send password setup email
    try {
      const { sendEmail, emailTemplates } = require('../utils/emailService');
      
      const emailData = {
        to: user.email,
        subject: 'Welcome to Yantra Daan - Requester Account Created',
        html: emailTemplates.welcomeNewRequester(user, token)
      };
      
      await sendEmail(emailData);
      console.log(`Password setup email sent to: ${user.email} by admin`);
    } catch (emailError) {
      console.error('Failed to send password setup email:', emailError);
      return res.status(500).json({ 
        error: 'Failed to send password setup email',
        details: emailError.message
      });
    }

    res.json({
      message: 'Password setup email sent successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userRole: user.userRole
      }
    });

  } catch (error) {
    console.error('Admin send password setup error:', error);
    res.status(500).json({ 
      error: 'Failed to send password setup email',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
