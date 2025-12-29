import client from './client';

/**
 * Consent management API endpoints
 */
export const consents = {
  list: (status) => client.get('/consents', { params: { status } }),
  grant: (data) => client.post('/consents/grant', data),
  revoke: (data) => client.post('/consents/revoke', data),
  getReceipt: (uuid) => client.get(`/consents/${uuid}/receipt`),
};

export default consents;
