const API_BASE = '/api';

export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || data.message || `Ошибка запроса (${response.status})`);
  }

  return data;
}

export const api = {
  // Requests
  getRequests: (params = {}) => {
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    }
    return fetchJson(`/requests?${query.toString()}`);
  },

  getRequestStats: () => fetchJson('/requests/stats'),

  getRequestById: (id) => fetchJson(`/requests/${id}`),

  createRequest: (data) => fetchJson('/requests', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateRequest: (id, updates) => fetchJson(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  reanalyzeRequest: (id) => fetchJson(`/requests/${id}/reanalyze`, {
    method: 'POST'
  }),

  generateQuote: (id, quoteData) => fetchJson(`/requests/${id}/generate-quote`, {
    method: 'POST',
    body: JSON.stringify(quoteData)
  }),

  sendReply: (id, replyData) => fetchJson(`/requests/${id}/send-reply`, {
    method: 'POST',
    body: JSON.stringify(replyData)
  }),

  deleteRequest: (id) => fetchJson(`/requests/${id}`, {
    method: 'DELETE'
  }),

  batchUpdateStatus: (ids, status) => fetchJson('/requests/batch-status', {
    method: 'POST',
    body: JSON.stringify({ ids, status })
  }),

  batchDelete: (ids) => fetchJson('/requests/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ ids })
  }),

  seedSamples: (clearExisting = false) => fetchJson('/requests/seed-samples', {
    method: 'POST',
    body: JSON.stringify({ clearExisting })
  }),

  generateSample: () => fetchJson('/requests/generate-sample', {
    method: 'POST'
  }),

  // Email
  fetchImap: (limit = 10) => fetchJson('/email/fetch-imap', {
    method: 'POST',
    body: JSON.stringify({ limit })
  }),

  testImap: (config) => fetchJson('/email/test-imap', {
    method: 'POST',
    body: JSON.stringify(config || {})
  }),

  uploadEml: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/email/upload-eml`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Ошибка загрузки файла');
    }
    return data;
  },

  analyzeRawText: (data) => fetchJson('/email/analyze-raw', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Settings
  getSettings: () => fetchJson('/settings'),

  saveSettings: (settings) => fetchJson('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),

  testAi: (config) => fetchJson('/settings/test-ai', {
    method: 'POST',
    body: JSON.stringify(config)
  }),

  // Analytics
  getAnalyticsDashboard: () => fetchJson('/analytics/dashboard')
};
