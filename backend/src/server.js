require('dotenv').config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToDatabase } = require('./config/db');
const requestsRouter = require('./routes/requests');
const donationsRouter = require('./routes/donations');
const deviceDonationsRouter = require('./routes/deviceDonations');
const contactsRouter = require('./routes/contacts');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/usersRoutes');
const devicesRouter = require('./routes/devices');
const deviceRequestsRouter = require('./routes/deviceRequests');
const adminRouter = require('./routes/admin');
const teamMembersRouter = require('./routes/teamMembers');
const verificationRouter = require('./routes/verification');
const learningRouter = require('./routes/learning');
const impactRouter = require('./routes/impact');
const { startCleanupJob } = require('./utils/cleanupJob');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve email template images
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Yantra Daan API Server Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/requests', requestsRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/device-donations', deviceDonationsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/device-requests', deviceRequestsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/admin/verification', verificationRouter);
app.use('/api/admin/learning', learningRouter);
app.use('/api/admin/impact', impactRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 5000;
// const mongoUri = process.env.MONGODB_URI || '';
const mongoUri = 'mongodb+srv://YantraDaan:YantraDaan7890@cluster0.trbr89b.mongodb.net/yantraDaan?retryWrites=true&w=majority&appName=Cluster0';

// Debug environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');

async function start() {
  if (!mongoUri) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }
  
  try {
    await connectToDatabase(mongoUri);
    console.log('✅ Connected to MongoDB successfully');
    
    // Start the cleanup job for expired users
    startCleanupJob();
    
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

start();