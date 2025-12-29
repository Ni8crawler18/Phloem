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
    // Only redirect to login for 401 errors on non-auth endpoints
    // Don't redirect if we're already trying to login/register
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/fiduciary/login') ||
                           error.config?.url?.includes('/auth/fiduciary/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
