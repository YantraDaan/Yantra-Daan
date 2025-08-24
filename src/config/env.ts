export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // App Configuration
  appName: 'YantraDaan',
  appVersion: '1.0.0',
  
  // Feature Flags
  features: {
    emailNotifications: true,
    fileUpload: true,
    analytics: false,
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
  
  // File Upload
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  
  // Email Configuration
  email: {
    supportEmail: 'support@yantradaan.com',
    noreplyEmail: 'noreply@yantradaan.com',
  },
  
  // Development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Debug
  debug: import.meta.env.DEV,
} as const;

export default config;
