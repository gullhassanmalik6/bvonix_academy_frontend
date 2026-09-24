import api from './api';

export const studentService = {
  /**
   * Get all students
   */
  async getStudents(params = {}) {
    const response = await api.get('/students', { params });
    return response.data;
  },

  /**
   * Get student by ID
   */
  async getStudentById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Get student by user ID
   */
  async getStudentByUserId(userId) {
    const response = await api.get(`/students/user/${userId}`);
    return response.data;
  },

  /**
   * Create student
   */
  async createStudent(data) {
    const response = await api.post('/students', data);
    return response.data;
  },

  /**
   * Update student
   */
  async updateStudent(id, data) {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Enroll in course
   */
  async enrollInCourse(studentId, courseId) {
    const response = await api.post(`/students/${studentId}/enroll/${courseId}`);
    return response.data;
  },

  /**
   * Unenroll from course
   */
  async unenrollFromCourse(studentId, courseId) {
    const response = await api.post(`/students/${studentId}/unenroll/${courseId}`);
    return response.data;
  },

  /**
   * Delete student
   */
  async deleteStudent(id) {
    await api.delete(`/students/${id}`);
  },
};
