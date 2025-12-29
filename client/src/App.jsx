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

function AppRoutes() {
  const { user, role } = useAuth();
  const location = useLocation();

  // Don't show navbar on dashboard, login, or register pages
  const hideNavbar =
    ['/dashboard', '/login', '/register'].includes(location.pathname) ||
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
