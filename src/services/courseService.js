import api from './api';

export const courseService = {
  /**
   * Get all courses (requires auth) or public published courses
   */
  async getCourses(params = {}) {
    const token = localStorage.getItem('token');
    const endpoint = token ? '/courses' : '/public/courses';
    const response = await api.get(endpoint, { params: token ? params : { skip: params.skip || 0, limit: params.limit || 100 } });
    return response.data;
  },

  /**
   * Get course by ID (uses public endpoint when not logged in)
   */
  async getCourseById(id) {
    const token = localStorage.getItem('token');
    const endpoint = token ? `/courses/${id}` : `/public/courses/${id}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get courses by instructor
   */
  async getCoursesByInstructor(instructorId) {
    const response = await api.get(`/courses/instructor/${instructorId}/courses`);
    return response.data;
  },

  /**
   * Create course
   */
  async createCourse(data) {
    const response = await api.post('/courses', data);
    return response.data;
  },

  /**
   * Update course
   */
  async updateCourse(id, data) {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  },

  /**
   * Delete course
   */
  async deleteCourse(id) {
    await api.delete(`/courses/${id}`);
  },
};
