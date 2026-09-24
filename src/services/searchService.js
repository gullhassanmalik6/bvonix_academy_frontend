import api from './api';

export const searchService = {
  async search(query, types = ['course', 'student', 'user'], limit = 20) {
    const params = {
      q: query,
      types: types.join(','),
      limit,
    };
    const response = await api.get('/search', { params });
    return response.data;
  },
};
