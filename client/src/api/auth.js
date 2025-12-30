import client from './client';

/**
 * Authentication API endpoints
 */
export const auth = {
  // User auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
  // Get user with explicit token (bypasses localStorage interceptor)
  meWithToken: (token) => client.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // User email verification
  verifyEmail: (token) => client.post('/auth/verify-email', { token }),
  resendVerification: (email) => client.post('/auth/resend-verification', { email }),

  // User password reset
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => client.post('/auth/reset-password', { token, new_password }),

  // Fiduciary auth
  fiduciaryRegister: (data) => client.post('/auth/fiduciary/register', data),
  fiduciaryLogin: (data) => client.post('/auth/fiduciary/login', data),
  fiduciaryMe: () => client.get('/auth/fiduciary/me'),
  // Get fiduciary with explicit token (bypasses localStorage interceptor)
  fiduciaryMeWithToken: (token) => client.get('/auth/fiduciary/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),

  // Fiduciary email verification
  fiduciaryVerifyEmail: (token) => client.post('/auth/fiduciary/verify-email', { token }),
  fiduciaryResendVerification: (email) => client.post('/auth/fiduciary/resend-verification', { email }),

  // Fiduciary password reset
  fiduciaryForgotPassword: (email) => client.post('/auth/fiduciary/forgot-password', { email }),
  fiduciaryResetPassword: (token, new_password) => client.post('/auth/fiduciary/reset-password', { token, new_password }),
};

export default auth;
