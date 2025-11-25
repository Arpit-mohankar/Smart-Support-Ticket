import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const tickets = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.patch(`/tickets/${id}`, data),
};

export const notes = {
  getByTicket: (ticketId) => api.get(`/tickets/${ticketId}/notes`),
  create: (ticketId, data) => api.post(`/tickets/${ticketId}/notes`, data),
};

export default api;
