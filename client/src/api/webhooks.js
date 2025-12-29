import client from './client';

/**
 * Webhook management API endpoints
 */
export const webhooks = {
  // List all webhooks for the current fiduciary
  list: () => client.get('/webhooks'),

  // Get a specific webhook
  get: (uuid) => client.get(`/webhooks/${uuid}`),

  // Create a new webhook
  create: (data) => client.post('/webhooks', data),

  // Update a webhook
  update: (uuid, data) => client.put(`/webhooks/${uuid}`, data),

  // Delete a webhook
  delete: (uuid) => client.delete(`/webhooks/${uuid}`),

  // Test a webhook
  test: (uuid) => client.post(`/webhooks/${uuid}/test`),

  // Regenerate webhook secret
  regenerateSecret: (uuid) => client.post(`/webhooks/${uuid}/regenerate-secret`),

  // Get webhook delivery logs
  deliveries: (uuid, limit = 50) => client.get(`/webhooks/${uuid}/deliveries`, { params: { limit } }),
};

export default webhooks;
