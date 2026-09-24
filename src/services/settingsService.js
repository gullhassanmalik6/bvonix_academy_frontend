import api from './api';

export const settingsService = {
  async getProfile() {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch('/settings/profile', data);
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/settings/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async getNotificationPreferences() {
    const response = await api.get('/settings/notifications');
    return response.data;
  },

  async updateNotificationPreferences(preferences) {
    const response = await api.patch('/settings/notifications', preferences);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/settings/account');
    return response.data;
  },
};
