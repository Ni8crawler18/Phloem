import client from './client';

/**
 * Settings API endpoints for user and fiduciary profile management
 */
export const settings = {
  // User settings
  user: {
    getProfile: () => client.get('/settings/user/profile'),
    updateProfile: (data) => client.put('/settings/user/profile', data),
    changePassword: (data) => client.post('/settings/user/change-password', data),
    deleteAccount: (data) => client.post('/settings/user/delete-account', data),
  },

  // Fiduciary settings
  fiduciary: {
    getProfile: () => client.get('/settings/fiduciary/profile'),
    updateProfile: (data) => client.put('/settings/fiduciary/profile', data),
    changePassword: (data) => client.post('/settings/fiduciary/change-password', data),
    deleteAccount: (data) => client.post('/settings/fiduciary/delete-account', data),
  },
};

export default settings;
