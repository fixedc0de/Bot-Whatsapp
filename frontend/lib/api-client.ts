import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bot_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
