# Feature Flags Documentation

## 🚀 Overview

Feature Flags (also known as Feature Toggles) are a software development technique that allows teams to modify system behavior without changing code. In YantraDaan, we use feature flags to:

- **Control feature rollout**: Enable/disable features without deployment
- **A/B testing**: Test different features with different user groups
- **Environment management**: Have different features enabled in dev/staging/prod
- **Emergency rollbacks**: Quickly disable problematic features
- **Gradual releases**: Roll out features to a percentage of users

## 🏗️ Architecture

### Frontend Implementation
- **Hook**: `useFeatureFlag()` - React hook for checking feature status
- **Provider**: `FeatureFlagProvider` - Context provider for feature flags
- **Storage**: LocalStorage for persistence across sessions
- **Fallback**: Environment-based defaults for unknown features

### Backend Integration
- **API Endpoints**: `/api/admin/feature-flags` for management
- **Database**: Feature flags stored in MongoDB
- **Caching**: Redis caching for performance (optional)
- **Validation**: Server-side validation of flag values

## 📋 Available Feature Flags

### Core Features (Always Enabled)
```typescript
userAuthentication: true      // User login/registration
deviceManagement: true        // Device posting and management
requestManagement: true       // Device request system
adminPanel: true             // Admin dashboard and controls
```

### Optional Features (Configurable)
```typescript
teamManagement: true          // Team member management
analytics: false              // Advanced analytics dashboard
advancedNotifications: false  // Push notifications, SMS
fileUpload: true             // File/image upload functionality
emailNotifications: true      // Email notification system
```

### Experimental Features (Development Only)
```typescript
realTimeChat: false           // Live chat between users
mobileApp: false              // React Native mobile app
paymentIntegration: false     // Payment processing
socialFeatures: false         // User interactions, reviews
```

### Performance Features
```typescript
caching: true                 // Response caching
compression: true             // Response compression
monitoring: false             // Performance monitoring
```

### Security Features
```typescript
twoFactorAuth: false          // 2FA authentication
rateLimiting: true            // API rate limiting
auditLogging: false           // User action logging
```

## 🛠️ Usage

### Basic Usage

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const MyComponent = () => {
  const { isFeatureEnabled } = useFeatureFlag();
  
  if (isFeatureEnabled('teamManagement')) {
    return <TeamManagementPanel />;
  }
  
  return <FeatureDisabledMessage />;
};
```

### Conditional Rendering

```typescript
const AdminPage = () => {
  const { isFeatureEnabled } = useFeatureFlag();
  
  return (
    <div>
      <h1>Admin Panel</h1>
      
      {/* Always visible */}
      <UserManagement />
      
      {/* Conditionally visible */}
      {isFeatureEnabled('teamManagement') && (
        <TeamManagement />
      )}
      
      {/* Feature with fallback */}
      {isFeatureEnabled('analytics') ? (
        <AnalyticsDashboard />
      ) : (
        <BasicStats />
      )}
    </div>
  );
};
```

### Dynamic Feature Checks

```typescript
const handleAction = async () => {
  const { isFeatureEnabled } = useFeatureFlag();
  
  if (isFeatureEnabled('advancedNotifications')) {
    // Use advanced notification system
    await sendPushNotification(userId, message);
  } else {
    // Fallback to basic notifications
    await sendEmailNotification(userId, message);
  }
};
```

### Feature Flag Management

```typescript
const FeatureFlagManager = () => {
  const { getFeatureFlags, updateFeatureFlag } = useFeatureFlag();
  
  const handleToggle = (feature: string, enabled: boolean) => {
    updateFeatureFlag(feature, enabled);
    
    // Optionally sync with backend
    syncFeatureFlagWithBackend(feature, enabled);
  };
  
  const flags = getFeatureFlags();
  
  return (
    <div>
      {Object.entries(flags).map(([feature, enabled]) => (
        <div key={feature}>
          <label>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(feature, e.target.checked)}
            />
            {feature}
          </label>
        </div>
      ))}
    </div>
  );
};
```

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
VITE_FEATURE_FLAGS_ENABLED=true
VITE_FEATURE_FLAGS_API_URL=http://localhost:5000/api/feature-flags
VITE_FEATURE_FLAGS_CACHE_TTL=300000  # 5 minutes
```

### Configuration File

```typescript
// src/config/featureFlags.ts
export const featureFlagConfig = {
  apiUrl: import.meta.env.VITE_FEATURE_FLAGS_API_URL,
  cacheTTL: parseInt(import.meta.env.VITE_FEATURE_FLAGS_CACHE_TTL || '300000'),
  defaultFlags: {
    // Default values for each environment
    development: {
      teamManagement: true,
      analytics: true,
      experimental: true
    },
    production: {
      teamManagement: true,
      analytics: false,
      experimental: false
    }
  }
};
```

### Backend Configuration

```javascript
// backend/config/featureFlags.js
module.exports = {
  defaultFlags: {
    teamManagement: true,
    analytics: false,
    // ... other flags
  },
  
  environmentOverrides: {
    development: {
      experimental: true,
      debug: true
    },
    production: {
      experimental: false,
      debug: false
    }
  },
  
  userGroupFlags: {
    beta: {
      newUI: true,
      advancedFeatures: true
    },
    standard: {
      newUI: false,
      advancedFeatures: false
    }
  }
};
```

## 🎯 Best Practices

### 1. Naming Conventions
- Use descriptive, lowercase names: `teamManagement`, `advancedAnalytics`
- Group related features: `emailNotifications`, `pushNotifications`
- Use consistent prefixes: `dev_`, `beta_`, `experimental_`

### 2. Default Values
- Core features should default to `true`
- Experimental features should default to `false`
- Environment-specific defaults should be clearly documented

### 3. Error Handling
```typescript
const { isFeatureEnabled } = useFeatureFlag();

// Always provide fallbacks
const component = isFeatureEnabled('newFeature') 
  ? <NewFeatureComponent />
  : <LegacyComponent />;

// Handle loading states
if (isFeatureEnabled === undefined) {
  return <LoadingSpinner />;
}
```

### 4. Performance Considerations
- Cache feature flag values
- Minimize API calls
- Use lazy loading for feature-dependent components

### 5. Testing
```typescript
// Test with different flag combinations
describe('Feature Flag Tests', () => {
  it('should show new UI when enabled', () => {
    // Mock feature flag
    jest.spyOn(useFeatureFlag(), 'isFeatureEnabled')
      .mockReturnValue(true);
    
    render(<MyComponent />);
    expect(screen.getByText('New UI')).toBeInTheDocument();
  });
  
  it('should show legacy UI when disabled', () => {
    jest.spyOn(useFeatureFlag(), 'isFeatureEnabled')
      .mockReturnValue(false);
    
    render(<MyComponent />);
    expect(screen.getByText('Legacy UI')).toBeInTheDocument();
  });
});
```

## 🚨 Emergency Procedures

### Quick Feature Disable
```typescript
// In case of critical issues, quickly disable features
const emergencyDisable = () => {
  const criticalFeatures = ['paymentIntegration', 'realTimeChat'];
  
  criticalFeatures.forEach(feature => {
    updateFeatureFlag(feature, false);
  });
  
  // Optionally notify backend
  notifyBackendOfEmergencyDisable(criticalFeatures);
};
```

### Rollback Strategy
```typescript
const rollbackFeature = (feature: string) => {
  // Revert to previous state
  const previousState = getFeatureFlagHistory(feature);
  updateFeatureFlag(feature, previousState);
  
  // Log rollback for audit
  logFeatureRollback(feature, previousState);
};
```

## 📊 Monitoring and Analytics

### Feature Usage Tracking
```typescript
const trackFeatureUsage = (feature: string, action: string) => {
  if (isFeatureEnabled('analytics')) {
    analytics.track('feature_used', {
      feature,
      action,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId()
    });
  }
};
```

### Performance Metrics
```typescript
const measureFeaturePerformance = (feature: string, callback: () => void) => {
  const start = performance.now();
  
  try {
    callback();
  } finally {
    const duration = performance.now() - start;
    
    if (isFeatureEnabled('monitoring')) {
      metrics.record('feature_performance', {
        feature,
        duration,
        success: true
      });
    }
  }
};
```

## 🔄 Migration Strategy

### Gradual Rollout
```typescript
const isFeatureEnabledForUser = (feature: string, userId: string) => {
  const { isFeatureEnabled } = useFeatureFlag();
  
  if (!isFeatureEnabled(feature)) {
    return false;
  }
  
  // Gradual rollout based on user ID
  const rolloutPercentage = getRolloutPercentage(feature);
  const userHash = hashUserId(userId);
  
  return (userHash % 100) < rolloutPercentage;
};
```

### Feature Dependencies
```typescript
const checkFeatureDependencies = (feature: string) => {
  const dependencies = {
    advancedAnalytics: ['basicAnalytics', 'dataCollection'],
    teamManagement: ['userManagement', 'roleBasedAccess']
  };
  
  const requiredFeatures = dependencies[feature] || [];
  
  return requiredFeatures.every(dep => isFeatureEnabled(dep));
};
```

## 📝 API Reference

### Frontend Hook
```typescript
interface FeatureFlagContextType {
  isFeatureEnabled: (feature: string) => boolean;
  getFeatureFlags: () => FeatureFlags;
  updateFeatureFlag: (feature: string, enabled: boolean) => void;
}

const useFeatureFlag = (): FeatureFlagContextType;
```

### Backend Endpoints
```bash
GET    /api/admin/feature-flags          # Get all flags
POST   /api/admin/feature-flags          # Create new flag
PUT    /api/admin/feature-flags/:id      # Update flag
DELETE /api/admin/feature-flags/:id      # Delete flag
PATCH  /api/admin/feature-flags/:id      # Partial update
```

## 🎉 Conclusion

Feature flags provide a powerful way to manage application features and enable safe, controlled deployments. By following these guidelines, you can:

- **Deploy with confidence**: Features can be disabled instantly if issues arise
- **Test in production**: Enable features for specific user groups
- **Manage complexity**: Gradually roll out complex features
- **Improve user experience**: A/B test different implementations
- **Reduce risk**: Minimize the impact of problematic deployments

Remember to always provide fallbacks for disabled features and monitor their usage to ensure a smooth user experience.
