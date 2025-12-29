import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

// Session timeout duration (15 minutes in milliseconds)
const SESSION_TIMEOUT = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    if (localStorage.getItem('token')) {
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  }, []);

  // Check if session has expired
  const checkSessionTimeout = useCallback(() => {
    const token = localStorage.getItem('token');
    const lastActivity = localStorage.getItem('lastActivity');

    if (token && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT) {
        // Session expired - logout
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('lastActivity');
        setUser(null);
        setRole(null);
        window.location.href = '/';
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  // Session timeout checker - runs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkSessionTimeout();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [checkSessionTimeout]);

  // Track user activity for session timeout
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      updateLastActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateLastActivity]);

  const checkAuth = async () => {
    // Check session timeout first
    if (checkSessionTimeout()) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');

    if (token && savedRole) {
      try {
        if (savedRole === 'fiduciary') {
          const response = await auth.fiduciaryMe();
          setUser(response.data);
          setRole('fiduciary');
        } else {
          const response = await auth.me();
          setUser(response.data);
          setRole('user');
        }
        // Update activity on successful auth check
        updateLastActivity();
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('lastActivity');
      }
    }
    setLoading(false);
  };

  const login = async (email, password, loginRole = 'user') => {
    let response;
    if (loginRole === 'fiduciary') {
      response = await auth.fiduciaryLogin({ email, password });
    } else {
      response = await auth.login({ email, password });
    }

    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('role', response.data.role || loginRole);
    localStorage.setItem('lastActivity', Date.now().toString());

    setRole(response.data.role || loginRole);

    // Fetch user/fiduciary details
    if (response.data.role === 'fiduciary' || loginRole === 'fiduciary') {
      const meResponse = await auth.fiduciaryMe();
      setUser(meResponse.data);
    } else {
      const meResponse = await auth.me();
      setUser(meResponse.data);
    }

    return response.data;
  };

  const register = async (data, registerRole = 'user') => {
    let response;
    if (registerRole === 'fiduciary') {
      response = await auth.fiduciaryRegister(data);
    } else {
      response = await auth.register(data);
    }
    // Both user and fiduciary registration now return a message
    // and require email verification before login
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('lastActivity');
    setUser(null);
    setRole(null);
  };

  // Update user data (e.g., after API key regeneration)
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Refresh user data from API
  const refreshUser = async () => {
    const savedRole = localStorage.getItem('role');
    if (savedRole === 'fiduciary') {
      const response = await auth.fiduciaryMe();
      setUser(response.data);
    } else {
      const response = await auth.me();
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
