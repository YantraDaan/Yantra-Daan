require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const UserModel = require('./src/models/UserModels');
const { hashPassword } = require('./src/utils/auth');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not set in environment.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await UserModel.findOne({ userRole: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminPassword = 'password123'; // Change this to a secure password
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = new UserModel({
      name: 'Admin User',
      email: 'admin@techshare.com',
      password: hashedPassword,
      userRole: 'admin',
      contact: '1234567890',
      categoryType: 'individual',
      isOrganization: false,
      about: 'System Administrator',
      profession: 'Administrator',
      address: 'Admin Address'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminPassword);
    console.log('Role:', adminUser.userRole);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser();
