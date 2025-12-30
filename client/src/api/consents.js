import client from './client';
import { API_BASE_URL } from '../constants';

/**
 * Consent management API endpoints
 */
export const consents = {
  list: (status) => client.get('/consents', { params: { status } }),
  grant: (data) => client.post('/consents/grant', data),
  revoke: (data) => client.post('/consents/revoke', data),
  renew: (consent_uuid) => client.post('/consents/renew', { consent_uuid }),
  expiring: (days = 14) => client.get('/consents/expiring/list', { params: { days } }),
  getReceipt: (uuid) => client.get(`/consents/${uuid}/receipt`),
  downloadReceiptPdf: async (uuid) => {
    // Use user_token specifically (not fiduciary token)
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/consents/${uuid}/receipt/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Check if response is an error
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to download PDF');
    }

    return response.blob();
  },
  exportJson: async () => {
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/consents/export/json`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to export JSON');
    }

    return response.blob();
  },
  exportCsv: async () => {
    const token = localStorage.getItem('user_token') || localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/consents/export/csv`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to export CSV');
    }

    return response.blob();
  },
};

export default consents;
