import api from './api';

export const adminService = {
  // ==================== Course Management ====================

  async getCourses(skip = 0, limit = 100, publishedOnly = false) {
    const response = await api.get('/admin/courses', {
      params: { skip, limit, published_only: publishedOnly },
    });
    return response.data;
  },

  async createCourse(data) {
    const response = await api.post('/admin/courses', data);
    return response.data;
  },

  async updateCourse(courseId, data) {
    const response = await api.patch(`/admin/courses/${courseId}`, data);
    return response.data;
  },

  async deleteCourse(courseId) {
    await api.delete(`/admin/courses/${courseId}`);
  },

  // ==================== User Management ====================

  async getUsers(skip = 0, limit = 100) {
    const response = await api.get('/admin/users', { params: { skip, limit } });
    return response.data;
  },

  async createUser(data) {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  async updateUser(userId, data) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId) {
    await api.delete(`/admin/users/${userId}`);
  },

  // ==================== Instructor Management ====================

  async getInstructors(skip = 0, limit = 100) {
    const response = await api.get('/admin/instructors', { params: { skip, limit } });
    return response.data;
  },

  async createInstructor(data) {
    const response = await api.post('/admin/instructors', data);
    return response.data;
  },

  async updateInstructor(instructorId, data) {
    const response = await api.patch(`/admin/instructors/${instructorId}`, data);
    return response.data;
  },

  async deleteInstructor(instructorId) {
    await api.delete(`/admin/instructors/${instructorId}`);
  },

  // ==================== Student Management ====================

  async getStudents(skip = 0, limit = 100) {
    const response = await api.get('/admin/students', { params: { skip, limit } });
    return response.data;
  },

  async createStudent(data) {
    const response = await api.post('/admin/students', data);
    return response.data;
  },

  async updateStudent(studentId, data) {
    const response = await api.patch(`/admin/students/${studentId}`, data);
    return response.data;
  },

  async deleteStudent(studentId) {
    await api.delete(`/admin/students/${studentId}`);
  },

  // ==================== Enrollment Management ====================

  async getEnrollments(skip = 0, limit = 100, status = null, paymentStatus = null, verified = null) {
    const params = { skip, limit };
    if (status) params.status = status;
    if (paymentStatus) params.payment_status = paymentStatus;
    if (verified !== null && verified !== '') params.verified = verified;
    const response = await api.get('/admin/enrollments', { params });
    return response.data;
  },

  async verifyEnrollment(enrollmentId) {
    const response = await api.patch(`/admin/enrollments/${enrollmentId}/verify`);
    return response.data;
  },

  async transitionEnrollment(enrollmentId, workflowState) {
    const response = await api.post(`/admin/enrollments/${enrollmentId}/transition`, {
      workflow_state: workflowState,
    });
    return response.data;
  },

  async generateEnrollmentCard(enrollmentId) {
    const response = await api.post(`/admin/enrollments/${enrollmentId}/generate-card`);
    return response.data;
  },

  async generateBulkEnrollmentCards(students) {
    const response = await api.post(
      '/cards/generate-student-cards/bulk',
      { students },
      { responseType: 'blob' }
    );
    return response.data;
  },

  async getEnrollmentCardForm(enrollmentId) {
    const response = await api.get(`/admin/enrollments/${enrollmentId}/card-form`);
    return response.data;
  },

  async updateEnrollmentCardForm(enrollmentId, data) {
    const response = await api.patch(`/admin/enrollments/${enrollmentId}/card-form`, data);
    return response.data;
  },

  async cancelEnrollment(enrollmentId) {
    const response = await api.patch(`/admin/enrollments/${enrollmentId}/cancel`);
    return response.data;
  },

  // ==================== Scholarship Management ====================

  async getScholarships(skip = 0, limit = 100, studentId = null, status = null) {
    const params = { skip, limit };
    if (studentId) params.student_id = studentId;
    if (status) params.status = status;
    const response = await api.get('/admin/scholarships', { params });
    return response.data;
  },

  async createScholarship(data) {
    const response = await api.post('/admin/scholarships', data);
    return response.data;
  },

  async updateScholarship(scholarshipId, data) {
    const response = await api.patch(`/admin/scholarships/${scholarshipId}`, data);
    return response.data;
  },

  async terminateScholarship(scholarshipId, reason) {
    const response = await api.post(`/admin/scholarships/${scholarshipId}/terminate`, null, {
      params: { reason },
    });
    return response.data;
  },

  async deleteScholarship(scholarshipId) {
    await api.delete(`/admin/scholarships/${scholarshipId}`);
  },

  // ==================== Attendance Management ====================

  async createAttendance(data) {
    const response = await api.post('/admin/attendance', data);
    return response.data;
  },

  async updateAttendance(attendanceId, data) {
    const response = await api.patch(`/admin/attendance/${attendanceId}`, data);
    return response.data;
  },

  // ==================== Course Materials ====================

  async getMaterials(courseId, skip = 0, limit = 100) {
    const response = await api.get(`/admin/courses/${courseId}/materials`, {
      params: { skip, limit },
    });
    return response.data;
  },

  async createMaterial(data) {
    const response = await api.post('/admin/materials', data);
    return response.data;
  },

  async updateMaterial(materialId, data) {
    const response = await api.patch(`/admin/materials/${materialId}`, data);
    return response.data;
  },

  async deleteMaterial(materialId) {
    await api.delete(`/admin/materials/${materialId}`);
  },

  // ==================== Assignments ====================

  async getAssignments(courseId, skip = 0, limit = 100) {
    const response = await api.get(`/admin/courses/${courseId}/assignments`, {
      params: { skip, limit },
    });
    return response.data;
  },

  async createAssignment(data) {
    const response = await api.post('/admin/assignments', data);
    return response.data;
  },

  async updateAssignment(assignmentId, data) {
    const response = await api.patch(`/admin/assignments/${assignmentId}`, data);
    return response.data;
  },

  async deleteAssignment(assignmentId) {
    await api.delete(`/admin/assignments/${assignmentId}`);
  },

  async getSubmissions(assignmentId) {
    const response = await api.get(`/admin/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  async gradeSubmission(submissionId, marksObtained, feedback = null) {
    const params = { marks_obtained: marksObtained };
    if (feedback) params.feedback = feedback;
    const response = await api.post(`/admin/submissions/${submissionId}/grade`, null, { params });
    return response.data;
  },

  // ==================== Live Sessions ====================

  async getSessions(courseId, skip = 0, limit = 100) {
    const response = await api.get(`/admin/courses/${courseId}/sessions`, {
      params: { skip, limit },
    });
    return response.data;
  },

  async createSession(data) {
    const response = await api.post('/admin/sessions', data);
    return response.data;
  },

  async updateSession(sessionId, data) {
    const response = await api.patch(`/admin/sessions/${sessionId}`, data);
    return response.data;
  },

  async deleteSession(sessionId) {
    await api.delete(`/admin/sessions/${sessionId}`);
  },

  // ==================== Announcements ====================

  async getAnnouncements(skip = 0, limit = 100, courseId = null) {
    const params = { skip, limit };
    if (courseId) params.course_id = courseId;
    const response = await api.get('/admin/announcements', { params });
    return response.data;
  },

  async createAnnouncement(data) {
    const response = await api.post('/admin/announcements', data);
    return response.data;
  },

  async updateAnnouncement(announcementId, data) {
    const response = await api.patch(`/admin/announcements/${announcementId}`, data);
    return response.data;
  },

  async deleteAnnouncement(announcementId) {
    await api.delete(`/admin/announcements/${announcementId}`);
  },

  // ==================== Payments ====================

  async getPayments(skip = 0, limit = 100, studentId = null, status = null) {
    const params = { skip, limit };
    if (studentId) params.student_id = studentId;
    if (status) params.payment_status = status;
    const response = await api.get('/admin/payments', { params });
    return response.data;
  },

  async createPayment(data) {
    const response = await api.post('/admin/payments', data);
    return response.data;
  },

  async updatePayment(paymentId, data) {
    const response = await api.patch(`/admin/payments/${paymentId}`, data);
    return response.data;
  },

  async getAuditLogs(skip = 0, limit = 50) {
    const response = await api.get('/admin/audit-logs', { params: { skip, limit } });
    return response.data;
  },

  async getAttendanceSummary() {
    const response = await api.get('/admin/attendance/summary');
    return response.data;
  },

  async getCertificateSummary() {
    const response = await api.get('/admin/certificates/summary');
    return response.data;
  },
};
