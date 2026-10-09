import api from './api';

export const uploadService = {
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/uploads/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadCourseImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/uploads/course-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadPaymentReceipt(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/uploads/payment-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
