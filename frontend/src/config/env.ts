export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  apiBasePath: import.meta.env.VITE_API_BASE_PATH || '/api',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Yantra Daan',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Digital device donation platform',
  
  // Environment
  isDevelopment: import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Build Configuration
  buildMode: import.meta.env.VITE_BUILD_MODE || 'development',
  sourceMap: import.meta.env.VITE_SOURCE_MAP === 'true',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebugLogging: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
  enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  
  // External Services
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  
  // Development Server
  devServerPort: parseInt(import.meta.env.VITE_DEV_SERVER_PORT || '3000'),
  devServerHost: import.meta.env.VITE_DEV_SERVER_HOST || 'localhost',
  
  // API Endpoints
  endpoints: {
    auth: '/api/auth',
    devices: '/api/devices',
    users: '/api/users',
    donations: '/api/donations',
    requests: '/api/device-requests',
    publicRequests: '/api/device-requests/public',
    teamMembers: '/api/team-members',
    admin: '/api/admin',
  },
  
  // Pagination
  pagination: {
    defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10'),
    maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100'),
  },
  
  // File Upload
  fileUpload: {
    maxSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
  
  // Timeout Configuration
  timeouts: {
    api: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    request: parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '10000'),
  },
  
  // Debug
  debug: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
} as const;

export default config;
