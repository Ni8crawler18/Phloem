import client from './client';

/**
 * Purpose management API endpoints (public)
 */
export const purposes = {
  list: (fiduciaryUuid) => client.get('/purposes', { params: { fiduciary_uuid: fiduciaryUuid } }),
  get: (uuid) => client.get(`/purposes/${uuid}`),
};

export default purposes;
