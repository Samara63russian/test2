import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const institutionService = {
  getAll: async (params) => {
    const res = await api.get('/institutions', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/institutions/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/institutions', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/institutions/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/institutions/${id}`);
    return res.data;
  },
};

export const questionService = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
  getAll: async (params) => {
    const res = await api.get('/questions', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/questions', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/questions/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },
};

export const reportService = {
  getAll: async (params) => {
    const res = await api.get('/reports', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/reports', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/reports/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/reports/${id}`);
    return res.data;
  },
  syncBatch: async (reports) => {
    const res = await api.post('/sync/batch', { reports });
    return res.data;
  },
};

export const userService = {
  getAll: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/users', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
};

export default api;
