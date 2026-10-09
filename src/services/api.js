import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function clearClientSession() {
  clearAccessToken();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

let refreshPromise = null;

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
      .then((response) => {
        const token = response.data?.access_token;
        if (!token) {
          throw new Error('Refresh failed');
        }
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get full URL for public file access
export const getFileUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${relativePath}`;
};

const PRIVATE_UPLOADS = {
  '/uploads/payment_receipts/': 'payment-receipts',
  '/uploads/profile_images/': 'profile-images',
  '/uploads/enrollment_cards/': 'enrollment-cards',
};

export function privateUploadKind(relativePath) {
  if (!relativePath || typeof relativePath !== 'string') return null;
  const path = relativePath.split('?')[0];
  const match = Object.entries(PRIVATE_UPLOADS).find(([prefix]) => path.startsWith(prefix));
  if (!match) return null;
  const filename = path.slice(match[0].length);
  if (!filename || filename.includes('/') || filename.includes('..')) return null;
  return { kind: match[1], filename };
}

export async function fetchPrivateObjectUrl(relativePath) {
  const located = privateUploadKind(relativePath);
  if (!located) return null;
  const response = await api.get(
    `/uploads/private/${located.kind}/${encodeURIComponent(located.filename)}`,
    { responseType: 'blob' },
  );
  return window.URL.createObjectURL(response.data);
}

export async function openPrivateUpload(relativePath) {
  const located = privateUploadKind(relativePath);
  if (!located) {
    const url = getFileUrl(relativePath);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  const objectUrl = await fetchPrivateObjectUrl(relativePath);
  if (!objectUrl) return;
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
}

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
    const isSessionCall = url.includes('/auth/refresh') || url.includes('/auth/logout');
    if (status === 401 && !isCredentialAttempt && !isSessionCall && error.config && !error.config._retry) {
      error.config._retry = true;
      return refreshAccessToken()
        .then((token) => {
          error.config.headers = error.config.headers || {};
          error.config.headers.Authorization = `Bearer ${token}`;
          return api(error.config);
        })
        .catch((refreshError) => {
          clearClientSession();
          const path = window.location.pathname;
          if (path !== '/login' && path !== '/register') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        });
    }
    return Promise.reject(error);
  }
);

export default api;
