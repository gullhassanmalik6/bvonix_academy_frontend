import api from './api';

export const notificationService = {
  async getNotifications(unreadOnly = false, limit = 50) {
    const params = { unread_only: unreadOnly, limit };
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },
};
