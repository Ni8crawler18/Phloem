import client from './client';

/**
 * Authentication API endpoints
 */
export const auth = {
  // User auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),

  // Fiduciary auth
  fiduciaryRegister: (data) => client.post('/auth/fiduciary/register', data),
  fiduciaryLogin: (data) => client.post('/auth/fiduciary/login', data),
  fiduciaryMe: () => client.get('/auth/fiduciary/me'),
};

export default auth;
