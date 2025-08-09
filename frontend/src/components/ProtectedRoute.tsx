import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'GOVERNMENT' | 'CITIZEN')[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malaysia-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (user && allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      const redirectPath = user.role === 'ADMIN' || user.role === 'GOVERNMENT' 
        ? '/admin-dashboard' 
        : '/citizen-dashboard';
      
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};