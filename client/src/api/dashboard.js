import client from './client';

/**
 * User dashboard API endpoints
 */
export const dashboard = {
  stats: () => client.get('/dashboard/stats'),
};

export default dashboard;
