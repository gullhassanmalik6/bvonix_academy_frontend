import api from './api';

export const authService = {
  /**
   * Register a new user
   * Note: Regular users cannot register as admin via this method.
   * Use AdminRegister page or create_admin.py script for admin accounts.
   */
  async register(data) {
    // Remove role from data to ensure regular users can't set admin role
    const { role, ...userData } = data;
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

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
