import { useContext, createContext } from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagContextType {
  isFeatureEnabled: (feature: string) => boolean;
  getFeatureFlags: () => FeatureFlags;
  updateFeatureFlag: (feature: string, enabled: boolean) => void;
}

const defaultFeatureFlags: FeatureFlags = {
  userAuthentication: true,
  deviceManagement: true,
  requestManagement: true,
  adminPanel: true,
  teamManagement: true,
  analytics: false,
  advancedNotifications: false,
  fileUpload: true,
  emailNotifications: false,
  realTimeChat: false,
  mobileApp: false,
  paymentIntegration: false,
  socialFeatures: false,
  caching: true,
  compression: true,
  monitoring: false,
  twoFactorAuth: false,
  rateLimiting: true,
  auditLogging: false,
};

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  isFeatureEnabled: () => false,
  getFeatureFlags: () => ({}),
  updateFeatureFlag: () => {},
});

export const useFeatureFlag = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context;
};

export const FeatureFlagProvider = ({ children }: { children: React.ReactNode }) => {
  const isFeatureEnabled = (feature: string): boolean => {
    if (feature in defaultFeatureFlags) {
      return defaultFeatureFlags[feature];
    }
    return false;
  };

  const getFeatureFlags = (): FeatureFlags => {
    return { ...defaultFeatureFlags };
  };

  const updateFeatureFlag = (feature: string, enabled: boolean) => {
    // For now, just log the change
    console.log(`Feature flag ${feature} set to ${enabled}`);
  };

  const value: FeatureFlagContextType = {
    isFeatureEnabled,
    getFeatureFlags,
    updateFeatureFlag,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
