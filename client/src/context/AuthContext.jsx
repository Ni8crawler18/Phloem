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
  // Separate state for user and fiduciary sessions
  const [userSession, setUserSession] = useState(null);
  const [fiduciarySession, setFiduciarySession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Current active session (for backward compatibility)
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

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Session timeout checker - runs every minute
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
    // Check session timeouts first
    checkSessionTimeout('user');
    checkSessionTimeout('fiduciary');

    const userToken = localStorage.getItem(STORAGE_KEYS.user.token);
    const fiduciaryToken = localStorage.getItem(STORAGE_KEYS.fiduciary.token);

    let loadedUserSession = null;
    let loadedFiduciarySession = null;

    // Check user session (use token directly in header, not localStorage)
    if (userToken) {
      try {
        const response = await auth.meWithToken(userToken);
        loadedUserSession = response.data;
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
        const response = await auth.fiduciaryMeWithToken(fiduciaryToken);
        loadedFiduciarySession = response.data;
        setFiduciarySession(response.data);
        updateLastActivity('fiduciary');
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.fiduciary.token);
        localStorage.removeItem(STORAGE_KEYS.fiduciary.lastActivity);
      }
    }

    // Set active session based on current path
    const path = window.location.pathname;
    if (path.includes('fiduciary') && loadedFiduciarySession) {
      localStorage.setItem('token', fiduciaryToken);
      localStorage.setItem('role', 'fiduciary');
      setUser(loadedFiduciarySession);
      setRole('fiduciary');
    } else if (loadedUserSession) {
      localStorage.setItem('token', userToken);
      localStorage.setItem('role', 'user');
      setUser(loadedUserSession);
      setRole('user');
    } else if (loadedFiduciarySession) {
      // Fallback to fiduciary if no user session
      localStorage.setItem('token', fiduciaryToken);
      localStorage.setItem('role', 'fiduciary');
      setUser(loadedFiduciarySession);
      setRole('fiduciary');
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
    return response.data;
  };

  const logout = (logoutRole = null) => {
    const targetRole = logoutRole || role || localStorage.getItem('role');

    if (targetRole === 'fiduciary') {
      localStorage.removeItem(STORAGE_KEYS.fiduciary.token);
      localStorage.removeItem(STORAGE_KEYS.fiduciary.lastActivity);
      setFiduciarySession(null);
    } else if (targetRole === 'user') {
      localStorage.removeItem(STORAGE_KEYS.user.token);
      localStorage.removeItem(STORAGE_KEYS.user.lastActivity);
      setUserSession(null);
    } else {
      // If role unknown, clear both to be safe
      localStorage.removeItem(STORAGE_KEYS.user.token);
      localStorage.removeItem(STORAGE_KEYS.user.lastActivity);
      localStorage.removeItem(STORAGE_KEYS.fiduciary.token);
      localStorage.removeItem(STORAGE_KEYS.fiduciary.lastActivity);
      setUserSession(null);
      setFiduciarySession(null);
    }

    // Clear active session
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

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

  const updateUser = (userData) => {
    setUser(userData);
    if (role === 'fiduciary') {
      setFiduciarySession(userData);
    } else {
      setUserSession(userData);
    }
  };

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

  const switchSession = (targetRole) => {
    const keys = STORAGE_KEYS[targetRole];
    const token = localStorage.getItem(keys.token);
    const sessionData = targetRole === 'fiduciary' ? fiduciarySession : userSession;

    if (token && sessionData) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', targetRole);
      setRole(targetRole);
      setUser(sessionData);
      return true;
    }
    return false;
  };

  const hasSession = (sessionRole) => {
    const keys = STORAGE_KEYS[sessionRole];
    const hasToken = !!localStorage.getItem(keys.token);
    const hasData = sessionRole === 'fiduciary' ? !!fiduciarySession : !!userSession;
    return hasToken && hasData;
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
