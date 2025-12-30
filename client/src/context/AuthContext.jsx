import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

// Session timeout duration (15 minutes in milliseconds)
const SESSION_TIMEOUT = 15 * 60 * 1000;

// Storage keys for separate sessions
const STORAGE_KEYS = {
  user: { token: 'user_token', lastActivity: 'user_lastActivity' },
  fiduciary: { token: 'fiduciary_token', lastActivity: 'fiduciary_lastActivity' }
};

export function AuthProvider({ children }) {
  // Separate state for user and fiduciary
  const [userSession, setUserSession] = useState(null);
  const [fiduciarySession, setFiduciarySession] = useState(null);
  const [loading, setLoading] = useState(true);

  // For backward compatibility
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Update last activity timestamp for a specific role
  const updateLastActivity = useCallback((sessionRole) => {
    const keys = STORAGE_KEYS[sessionRole];
    if (keys && localStorage.getItem(keys.token)) {
      localStorage.setItem(keys.lastActivity, Date.now().toString());
    }
  }, []);

  // Check if a specific session has expired
  const checkSessionTimeout = useCallback((sessionRole) => {
    const keys = STORAGE_KEYS[sessionRole];
    if (!keys) return false;

    const token = localStorage.getItem(keys.token);
    const lastActivity = localStorage.getItem(keys.lastActivity);

    if (token && lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT) {
        // Session expired - clear this session only
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.lastActivity);
        if (sessionRole === 'user') {
          setUserSession(null);
        } else {
          setFiduciarySession(null);
        }
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  // Session timeout checker - runs every minute for both sessions
  useEffect(() => {
    const interval = setInterval(() => {
      checkSessionTimeout('user');
      checkSessionTimeout('fiduciary');
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [checkSessionTimeout]);

  // Track user activity for session timeout
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // Update activity for the current active role based on URL
      const path = window.location.pathname;
      if (path.includes('fiduciary')) {
        updateLastActivity('fiduciary');
      } else if (path.includes('dashboard')) {
        updateLastActivity('user');
      }
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
    // Check both sessions
    checkSessionTimeout('user');
    checkSessionTimeout('fiduciary');

    const userToken = localStorage.getItem(STORAGE_KEYS.user.token);
    const fiduciaryToken = localStorage.getItem(STORAGE_KEYS.fiduciary.token);

    // Check user session
    if (userToken) {
      try {
        // Temporarily set token for API call
        localStorage.setItem('token', userToken);
        localStorage.setItem('role', 'user');
        const response = await auth.me();
        setUserSession(response.data);
        updateLastActivity('user');
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.user.token);
        localStorage.removeItem(STORAGE_KEYS.user.lastActivity);
      }
    }

    // Check fiduciary session
    if (fiduciaryToken) {
      try {
        // Temporarily set token for API call
        localStorage.setItem('token', fiduciaryToken);
        localStorage.setItem('role', 'fiduciary');
        const response = await auth.fiduciaryMe();
        setFiduciarySession(response.data);
        updateLastActivity('fiduciary');
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.fiduciary.token);
        localStorage.removeItem(STORAGE_KEYS.fiduciary.lastActivity);
      }
    }

    // Set active user/role based on current path
    const path = window.location.pathname;
    if (path.includes('fiduciary') && fiduciaryToken) {
      localStorage.setItem('token', fiduciaryToken);
      localStorage.setItem('role', 'fiduciary');
      setUser(fiduciarySession);
      setRole('fiduciary');
    } else if (userToken) {
      localStorage.setItem('token', userToken);
      localStorage.setItem('role', 'user');
      setUser(userSession);
      setRole('user');
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

    const actualRole = response.data.role || loginRole;
    const keys = STORAGE_KEYS[actualRole];

    // Store in role-specific storage
    localStorage.setItem(keys.token, response.data.access_token);
    localStorage.setItem(keys.lastActivity, Date.now().toString());

    // Also set as active token
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('role', actualRole);

    setRole(actualRole);

    // Fetch user/fiduciary details
    if (actualRole === 'fiduciary') {
      const meResponse = await auth.fiduciaryMe();
      setFiduciarySession(meResponse.data);
      setUser(meResponse.data);
    } else {
      const meResponse = await auth.me();
      setUserSession(meResponse.data);
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

  const logout = (logoutRole = null) => {
    // If no role specified, logout from current active role
    const targetRole = logoutRole || role;

    if (targetRole === 'fiduciary') {
      localStorage.removeItem(STORAGE_KEYS.fiduciary.token);
      localStorage.removeItem(STORAGE_KEYS.fiduciary.lastActivity);
      setFiduciarySession(null);
    } else if (targetRole === 'user') {
      localStorage.removeItem(STORAGE_KEYS.user.token);
      localStorage.removeItem(STORAGE_KEYS.user.lastActivity);
      setUserSession(null);
    }

    // Clear active session
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

  // Logout from all sessions
  const logoutAll = () => {
    localStorage.removeItem(STORAGE_KEYS.user.token);
    localStorage.removeItem(STORAGE_KEYS.user.lastActivity);
    localStorage.removeItem(STORAGE_KEYS.fiduciary.token);
    localStorage.removeItem(STORAGE_KEYS.fiduciary.lastActivity);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUserSession(null);
    setFiduciarySession(null);
    setUser(null);
    setRole(null);
  };

  // Update user data (e.g., after API key regeneration)
  const updateUser = (userData) => {
    setUser(userData);
    if (role === 'fiduciary') {
      setFiduciarySession(userData);
    } else {
      setUserSession(userData);
    }
  };

  // Refresh user data from API
  const refreshUser = async () => {
    const savedRole = localStorage.getItem('role');
    if (savedRole === 'fiduciary') {
      const response = await auth.fiduciaryMe();
      setUser(response.data);
      setFiduciarySession(response.data);
    } else {
      const response = await auth.me();
      setUser(response.data);
      setUserSession(response.data);
    }
  };

  // Switch active session (when navigating between dashboards)
  const switchSession = (targetRole) => {
    const keys = STORAGE_KEYS[targetRole];
    const token = localStorage.getItem(keys.token);

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', targetRole);
      setRole(targetRole);

      if (targetRole === 'fiduciary') {
        setUser(fiduciarySession);
      } else {
        setUser(userSession);
      }
      return true;
    }
    return false;
  };

  // Check if a specific session is active
  const hasSession = (sessionRole) => {
    const keys = STORAGE_KEYS[sessionRole];
    return !!localStorage.getItem(keys.token);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      userSession,
      fiduciarySession,
      login,
      register,
      logout,
      logoutAll,
      updateUser,
      refreshUser,
      switchSession,
      hasSession
    }}>
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
