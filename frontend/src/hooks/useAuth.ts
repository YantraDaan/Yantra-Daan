import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { config } from '@/config/env';

export const useAuth = () => {
  const auth = useAuthContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced token validation to prevent too many API calls
  const debouncedValidateToken = useCallback(async () => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(async () => {
      if (!auth.user) {
        setIsTokenValid(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      console.log('Debounced token validation for user:', auth.user.email);

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
          
          // Only logout if token is explicitly invalid AND we're sure about it
          if (!data.valid) {
            console.log('Token validation failed, logging out user');
            auth.logout();
          }
        } else if (response.status === 404) {
          // Endpoint not found - backend might not be running
          console.warn('Token validation endpoint not found. Backend might not be running.');
          setIsTokenValid(true); // Assume token is valid to avoid logout
        } else {
          // Response not ok, but don't immediately logout - might be temporary
          console.warn('Token validation failed, but not logging out immediately');
          // Don't change isTokenValid here to prevent unnecessary logout
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // On network errors, assume token is valid to avoid unnecessary logout
        setIsTokenValid(true);
      }
    }, 1000); // 1 second debounce
  }, [auth.user, auth.logout]);

  // Validate token on mount and when user changes - but less aggressively
  useEffect(() => {
    debouncedValidateToken();
    
    // Cleanup timeout on unmount
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [debouncedValidateToken]);

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
    return isAdmin() || auth.user?.email === 'yantradaan@gmail.com';
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