import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
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
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', 'fiduciary');
      setRole('fiduciary');

      const meResponse = await auth.fiduciaryMe();
      setUser(meResponse.data);
    } else {
      response = await auth.register(data);
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
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
