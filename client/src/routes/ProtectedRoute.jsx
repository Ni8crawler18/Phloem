import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <Loading message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole && role !== requiredRole) {
    // Redirect to the appropriate dashboard based on actual role
    if (role === 'fiduciary') {
      return <Navigate to="/fiduciary/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
