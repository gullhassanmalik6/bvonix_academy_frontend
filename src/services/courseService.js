import api, { getAccessToken } from './api';

export const courseService = {
  /**
   * Get all courses (requires auth) or public published courses
   */
  async getCourses(params = {}) {
    const token = getAccessToken();
    const endpoint = token ? '/courses' : '/public/courses';
    const response = await api.get(endpoint, { params: token ? params : { skip: params.skip || 0, limit: params.limit || 100 } });
    return response.data;
  },

  /**
   * Get course by ID (uses public endpoint when not logged in)
   */
  async getCourseById(id) {
    const token = getAccessToken();
    const endpoint = token ? `/courses/${id}` : `/public/courses/${id}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Published instructor, lesson titles, and practical work.
   * Lesson files and assignment instructions are not included.
   */
  async getCourseDecision(id) {
    const response = await api.get(`/public/courses/${id}/decision`);
    return response.data;
  },

  /**
   * Get courses by instructor
   */
  async getCoursesByInstructor(instructorId) {
    const limit = 100;
    let skip = 0;
    let items = [];
    let more = true;
    while (more) {
      const response = await api.get(`/courses/instructor/${instructorId}/courses`, {
        params: { skip, limit },
      });
      const data = response.data;
      if (!data || !Array.isArray(data.items) || typeof data.total !== 'number') return data;
      items = items.concat(data.items);
      if (data.items.length === 0 || skip + data.items.length >= data.total) {
        more = false;
        return items;
      }
      skip += data.items.length;
    }
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
