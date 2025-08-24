# YantraDaan - Device Donation Platform

A comprehensive platform for managing device donations, requests, and user interactions with role-based access control and email notifications.

## 🚀 Features

### Core Functionality
- **Device Donation Management**: Post, approve, and manage device donations
- **Request System**: Students can request devices with approval workflow
- **Role-Based Access Control**: Admin, Donor, and Requester roles
- **Email Notifications**: Automatic email notifications for all status changes
- **Admin Dashboard**: Comprehensive admin panel for managing all aspects

### User Roles
- **Admin**: Full system access, device approval, request management
- **Donor**: Post devices, manage donations, approve/reject requests
- **Requester**: Browse devices, submit requests, track status

### Technical Features
- **Real-time Updates**: Automatic data refresh and state management
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error boundaries and user feedback
- **API Integration**: Centralized API service with proper error handling
- **Security**: JWT authentication, role-based authorization

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email services
- **Express File Upload** for file handling

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- SMTP email service (Gmail, SendGrid, etc.)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd yantradaan
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Environment Configuration

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

#### Backend (config.env)
```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# CORS Configuration
FRONTEND_URL=http://localhost:5001
```

### 5. Database Setup
Ensure MongoDB is running and accessible with the connection string in your config.

### 6. Email Service Setup
For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in SMTP_PASS

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

#### Start Frontend Development Server
```bash
npm run dev
```
Frontend will run on http://localhost:5001

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
yantradaan/
├── src/                    # Frontend source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utility functions and API service
│   └── config/           # Configuration files
├── backend/               # Backend source code
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Database configuration
│   └── config.env        # Environment variables
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Devices
- `GET /api/devices/approved` - Get approved devices
- `POST /api/devices` - Create new device post
- `PUT /api/devices/:id/status` - Update device status (admin)

### Device Requests
- `POST /api/device-requests` - Create device request
- `GET /api/device-requests/my` - Get user's requests
- `PUT /api/device-requests/admin/:id/status` - Update request status
- `GET /api/device-requests/device/:deviceId` - Get requests for device

### Admin
- `GET /api/device-requests/admin/all` - Get all requests
- `GET /api/devices/admin/all` - Get all devices
- `GET /api/users` - Get all users

## 🎯 Key Components

### AdminDashboard
Comprehensive admin interface for managing device requests with:
- Request filtering and search
- Approval/rejection workflow
- Email notifications
- Detailed request information

### ProfilePage
Integrated user profile with:
- Request management for requesters
- Device management for donors
- Statistics and analytics

### DeviceBrowse
Device browsing interface with:
- Role-based request buttons
- Device filtering and search
- Request submission workflow

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Secure password handling

## 📧 Email Notifications

The system automatically sends emails for:
- New device posts (admin notification)
- Device approval/rejection (donor notification)
- Request approval/rejection (requester notification)
- Request approval (device owner notification)

## 🐛 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check network connectivity

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure MongoDB is running

3. **Frontend Not Loading**
   - Check if backend is running
   - Verify API URL configuration
   - Check browser console for errors

4. **Authentication Issues**
   - Clear localStorage
   - Check JWT secret configuration
   - Verify token expiration

### Development Tips

- Use browser dev tools to debug API calls
- Check backend console for error logs
- Use React DevTools for component debugging
- Monitor network tab for failed requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@yantradaan.com

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and updates.
