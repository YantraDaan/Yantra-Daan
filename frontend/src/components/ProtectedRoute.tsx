import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: string | string[];
  redirectTo?: string;
  showLoading?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/login',
  showLoading = true,
}: ProtectedRouteProps) => {
  const { user, isLoading, isTokenValid } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // If user is authenticated but token is invalid
  if (requireAuth && user && !isTokenValid) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // If specific role is required
  if (requireRole && user) {
    const userRole = user.userRole;
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    
    if (!requiredRoles.includes(userRole)) {
      // Redirect to unauthorized page or show access denied
      return (
        <Navigate
          to="/unauthorized"
          state={{ from: location }}
          replace
        />
      );
    }
  }

  // If user is authenticated and trying to access login/signup pages
  if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const RequireAuth = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={true}>{children}</ProtectedRoute>
);

export const RequireGuest = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>
);

export const RequireAdmin = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={true} requireRole="admin">{children}</ProtectedRoute>
);

export const RequireDonor = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={true} requireRole="donor">{children}</ProtectedRoute>
);

export const RequireRequester = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requireAuth={true} requireRole="requester">{children}</ProtectedRoute>
);

export const RequireAnyRole = ({ children, roles }: { children: ReactNode; roles: string[] }) => (
  <ProtectedRoute requireAuth={true} requireRole={roles}>{children}</ProtectedRoute>
);
