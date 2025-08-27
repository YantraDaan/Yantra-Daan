import { useCallback, useEffect, useState } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { config } from '@/config/env';

export const useAuth = () => {
  const auth = useAuthContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Validate token on mount and when user changes
  useEffect(() => {
    const validateToken = async () => {
      if (!auth.user) {
        setIsTokenValid(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      console.log('Validating token for user:', auth.user.email);

      try {
        const response = await fetch(`${config.apiUrl}/api/auth/validate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsTokenValid(data.valid);
          
          if (!data.valid) {
            // Token is invalid, logout user
            auth.logout();
          }
        } else if (response.status === 404) {
          // Endpoint not found - backend might not be running
          console.warn('Token validation endpoint not found. Backend might not be running.');
          setIsTokenValid(true); // Assume token is valid to avoid logout
        } else {
          // Response not ok, token is invalid
          setIsTokenValid(false);
          auth.logout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // On network errors, assume token is valid to avoid unnecessary logout
        setIsTokenValid(true);
      }
    };

    // Only validate if we have both user and token
    if (auth.user && localStorage.getItem('authToken')) {
      validateToken();
    } else {
      setIsTokenValid(false);
    }
  }, [auth.user]);

  // Auto-logout when token expires
  useEffect(() => {
    if (!isTokenValid && auth.user) {
      auth.logout();
    }
  }, [isTokenValid, auth.user, auth]);

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return auth.user?.userRole === role;
  }, [auth.user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  // Check if user is donor
  const isDonor = useCallback(() => {
    return hasRole('donor');
  }, [hasRole]);

  // Check if user is requester
  const isRequester = useCallback(() => {
    return hasRole('requester');
  }, [hasRole]);

  // Get user's display name
  const getDisplayName = useCallback(() => {
    if (!auth.user) return '';
    return auth.user.name || auth.user.email?.split('@')[0] || 'User';
  }, [auth.user]);

  // Check if user can access admin features
  const canAccessAdmin = useCallback(() => {
    return isAdmin() || auth.user?.email === 'admin@techshare.com';
  }, [isAdmin, auth.user]);

  return {
    ...auth,
    isOnline,
    isTokenValid,
    hasRole,
    isAdmin,
    isDonor,
    isRequester,
    getDisplayName,
    canAccessAdmin,
    adminLogin: auth.adminLogin, // Explicitly expose adminLogin
  };
};
