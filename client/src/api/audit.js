import client from './client';

/**
 * Audit log API endpoints
 */
export const auditLogs = {
  list: (params) => client.get('/audit-logs', { params }),
};

export default auditLogs;
