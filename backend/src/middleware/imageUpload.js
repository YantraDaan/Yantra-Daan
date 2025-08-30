const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for different types of image uploads
const createStorage = (uploadType) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      // Create main uploads directory if it doesn't exist
      const mainUploadDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(mainUploadDir)) {
        fs.mkdirSync(mainUploadDir, { recursive: true });
      }
      
      // Create specific subdirectory for the upload type
      const uploadDir = path.join(mainUploadDir, uploadType);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp and random suffix
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const filename = `${uploadType}-${uniqueSuffix}${fileExtension}`;
      cb(null, filename);
    }
  });
};

// Create multer instances for different upload types
const createUpload = (uploadType) => {
  return multer({
    storage: createStorage(uploadType),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
      // Allow only image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`));
      }
    }
  });
};

// Export specific upload instances
const teamMemberUpload = createUpload('team-members');
const deviceUpload = createUpload('devices');
const profileUpload = createUpload('profiles');
const generalUpload = createUpload('general');

// Export the createUpload function for custom upload types
const createCustomUpload = createUpload;

module.exports = {
  teamMemberUpload,
  deviceUpload,
  profileUpload,
  generalUpload,
  createCustomUpload
};
