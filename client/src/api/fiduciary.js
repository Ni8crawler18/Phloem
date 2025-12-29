import client from './client';

/**
 * Fiduciary management API endpoints
 */

// Public fiduciary endpoints
export const fiduciaries = {
  list: () => client.get('/fiduciaries'),
  get: (uuid) => client.get(`/fiduciaries/${uuid}`),
};

// Authenticated fiduciary dashboard endpoints
export const fiduciaryDashboard = {
  stats: () => client.get('/fiduciary/dashboard/stats'),
  purposes: () => client.get('/fiduciary/purposes'),
  createPurpose: (data) => client.post('/fiduciary/purposes', data),
  updatePurpose: (uuid, data) => client.put(`/fiduciary/purposes/${uuid}`, data),
  deletePurpose: (uuid) => client.delete(`/fiduciary/purposes/${uuid}`),
  consents: (params) => client.get('/fiduciary/consents', { params }),
  regenerateApiKey: () => client.post('/fiduciary/api-key/regenerate'),
};

export default { fiduciaries, fiduciaryDashboard };
