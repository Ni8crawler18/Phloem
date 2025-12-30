import axios from 'axios';
import { API_BASE_URL } from '../constants';

/**
 * Base Axios client with interceptors
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors on non-auth endpoints
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/fiduciary/login') ||
                           error.config?.url?.includes('/auth/fiduciary/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear the specific session that failed based on the endpoint
      const url = error.config?.url || '';
      const currentRole = localStorage.getItem('role');

      if (url.includes('/fiduciary') || currentRole === 'fiduciary') {
        localStorage.removeItem('fiduciary_token');
        localStorage.removeItem('fiduciary_lastActivity');
      } else {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_lastActivity');
      }

      // Clear active session
      localStorage.removeItem('token');
      localStorage.removeItem('role');

      // Only redirect if no other session exists
      const hasUserSession = localStorage.getItem('user_token');
      const hasFiduciarySession = localStorage.getItem('fiduciary_token');

      if (!hasUserSession && !hasFiduciarySession) {
        window.location.href = '/login';
      } else {
        // Reload to switch to the other available session
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default client;
