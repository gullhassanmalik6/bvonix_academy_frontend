import api from './api';

export const authService = {
  /**
   * Register a student account. Administrator accounts are created by an existing admin.
   */
  async register(data) {
    const userData = { ...data };
    delete userData.role;
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
