import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading, switchSession, hasSession } = useAuth();
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    // If required role doesn't match current role, try to switch
    if (!loading && requiredRole && role !== requiredRole && hasSession(requiredRole)) {
      setSwitching(true);
      switchSession(requiredRole);
      setSwitching(false);
    }
  }, [loading, requiredRole, role, switchSession, hasSession]);

  if (loading || switching) {
    return <Loading message="Authenticating..." />;
  }

  // Check if user has the required session
  if (requiredRole && hasSession(requiredRole)) {
    // If we have the session but role hasn't switched yet, wait
    if (role !== requiredRole) {
      switchSession(requiredRole);
      return <Loading message="Switching session..." />;
    }
  }

  if (!user && !hasSession(requiredRole || 'user')) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have that session
  if (requiredRole && !hasSession(requiredRole)) {
    // Redirect to login for that role
    return <Navigate to="/login" replace />;
  }

  return children;
}
