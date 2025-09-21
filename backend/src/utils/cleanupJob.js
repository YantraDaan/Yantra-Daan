const UserModel = require('../models/UserModels');
const { sendEmail } = require('./emailService');

// Function to delete users who haven't set up their password within 7 days
const deleteExpiredUsers = async () => {
  try {
    console.log('Running cleanup job: Checking for users with expired password setup...');
    
    // Find users who have password setup required and whose setup has expired
    const expiredUsers = await UserModel.find({
      passwordSetupRequired: true,
      passwordSetupExpires: { $lt: new Date() }
    });
    
    console.log(`Found ${expiredUsers.length} users with expired password setup`);
    
    if (expiredUsers.length === 0) {
      console.log('No users to delete');
      return { deleted: 0, notified: 0 };
    }
    
    let deletedCount = 0;
    let notifiedCount = 0;
    
    // Process each expired user
    for (const user of expiredUsers) {
      try {
        // Send notification email before deletion (optional)
        const notificationEmail = {
          to: user.email,
          subject: 'Account Deleted - Yantra Daan',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Account Deleted - Yantra Daan</h2>
              <p>Hello ${user.name},</p>
              <p>We're sorry to inform you that your account on Yantra Daan has been deleted because you didn't set up your password within 7 days of registration.</p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #991b1b;">Account Details:</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Registered On:</strong> ${user.createdAt.toLocaleDateString()}</p>
                <p><strong>Password Setup Expired On:</strong> ${user.passwordSetupExpires.toLocaleDateString()}</p>
              </div>
              
              <p>If you still wish to join Yantra Daan, you can <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/register">register again</a>.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Thank you for your interest in Yantra Daan.
              </p>
            </div>
          `
        };
        
        await sendEmail(notificationEmail);
        notifiedCount++;
        console.log(`Notification email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(`Failed to send notification email to ${user.email}:`, emailError);
      }
      
      // Delete the user
      await UserModel.findByIdAndDelete(user._id);
      deletedCount++;
      console.log(`Deleted user: ${user.name} (${user.email})`);
    }
    
    console.log(`Cleanup job completed: ${deletedCount} users deleted, ${notifiedCount} notified`);
    return { deleted: deletedCount, notified: notifiedCount };
  } catch (error) {
    console.error('Error in cleanup job:', error);
    throw error;
  }
};

// Function to start the cleanup job
const startCleanupJob = () => {
  console.log('Starting cleanup job scheduler...');
  
  // Run immediately on startup
  deleteExpiredUsers().catch(error => {
    console.error('Initial cleanup job failed:', error);
  });
  
  // Run every 24 hours
  setInterval(async () => {
    try {
      await deleteExpiredUsers();
    } catch (error) {
      console.error('Scheduled cleanup job failed:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
  console.log('Cleanup job scheduled to run every 24 hours');
};

module.exports = {
  deleteExpiredUsers,
  startCleanupJob
};