import api from './api';

export const cardService = {
  async getPreviewData(enrollmentId) {
    const { data } = await api.get(`/cards/preview/${enrollmentId}`);
    return data;
  },

  async downloadEnrollmentCard(enrollmentId) {
    const response = await api.get(`/cards/enrollments/${enrollmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async generateStudentCard(cardData) {
    const response = await api.post(
      '/cards/generate-student-card',
      { data: cardData },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async generateBulkCards(students) {
    const response = await api.post(
      '/cards/generate-student-cards/bulk',
      { students },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async verifyCard(cardNumber) {
    const { data } = await api.get(`/public/verify/${encodeURIComponent(cardNumber)}`);
    return data;
  },

  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default cardService;
