import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get full URL for file access
export const getFileUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${relativePath}`;
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function textFromPayload(data) {
  if (!data || typeof data !== 'object') return '';
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  const detail = data.detail;
  if (typeof detail === 'string' && detail.trim()) return detail.trim();
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.msg === 'string') return item.msg;
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

export async function getApiErrorMessage(error, fallback = 'Request failed') {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return textFromPayload(parsed) || fallback;
    } catch {
      return fallback;
    }
  }
  return textFromPayload(data) || error?.message || fallback;
}

export async function interpretApiError(error, fallback = 'Request failed') {
  const status = error?.response?.status;
  let message = await getApiErrorMessage(error, fallback);
  if (status === 403) {
    if (!message || message === fallback || message === 'Request failed' || message === 'Network Error') {
      message = 'You do not have permission to view this.';
    }
    return { kind: 'denied', status, message };
  }
  return { kind: 'error', status, message };
}

export function viewFromFailure(failure) {
  return failure?.kind === 'denied' ? 'denied' : 'error';
}

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isCredentialAttempt = url.includes('/auth/login') || url.includes('/auth/register');
    if (status === 401 && !isCredentialAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
