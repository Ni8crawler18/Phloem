import client from './client';
import { API_BASE_URL } from '../constants';

/**
 * Consent management API endpoints
 */
export const consents = {
  list: (status) => client.get('/consents', { params: { status } }),
  grant: (data) => client.post('/consents/grant', data),
  revoke: (data) => client.post('/consents/revoke', data),
  getReceipt: (uuid) => client.get(`/consents/${uuid}/receipt`),
  downloadReceiptPdf: async (uuid) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/consents/${uuid}/receipt/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.blob();
  },
};

export default consents;
