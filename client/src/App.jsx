import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FiduciaryDashboard from './pages/FiduciaryDashboard';
import SdkDemo from './pages/SdkDemo';
import Api from './pages/Api';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function AppRoutes() {
  const { user, role } = useAuth();
  const location = useLocation();

  // Don't show navbar on dashboard, login, register, or auth pages
  const hideNavbar =
    ['/dashboard', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'].includes(location.pathname) ||
    location.pathname.startsWith('/fiduciary');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sdk-demo" element={<SdkDemo />} />
        <Route path="/api" element={<Api />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to={role === 'fiduciary' ? '/fiduciary/dashboard' : '/dashboard'}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate
                to={role === 'fiduciary' ? '/fiduciary/dashboard' : '/dashboard'}
                replace
              />
            ) : (
              <Register />
            )
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fiduciary/dashboard"
          element={
            <ProtectedRoute requiredRole="fiduciary">
              <FiduciaryDashboard />
            </ProtectedRoute>
          }
        />
        {/* Catch-all route - redirect undefined routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
