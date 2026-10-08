import api from './api';

export const lmsService = {
  // ==================== Enrollment ====================
  
  async enrollInCourse(courseId, enrollmentData) {
    const response = await api.post(`/lms/enroll/${courseId}`, enrollmentData);
    return response.data;
  },

  async fetchEnrollmentCardBlob(enrollmentId) {
    const response = await api.get(`/lms/enrollments/${enrollmentId}/card`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async viewEnrollmentCard(enrollmentId) {
    const blob = await this.fetchEnrollmentCardBlob(enrollmentId);
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.URL.revokeObjectURL(url);
      throw new Error('Pop-up blocked. Please allow pop-ups to view your enrollment card.');
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 120000);
  },

  async downloadEnrollmentCard(enrollmentId) {
    const blob = await this.fetchEnrollmentCardBlob(enrollmentId);
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `enrollment_card_${enrollmentId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async uploadPaymentReceipt(enrollmentId, receiptUrl) {
    const response = await api.post(`/lms/enrollments/${enrollmentId}/payment-receipt`, {
      receipt_url: receiptUrl,
    });
    return response.data;
  },

  async getMyEnrollments() {
    const response = await api.get('/lms/enrollments');
    return response.data;
  },

  async checkLMSAccess() {
    const response = await api.get('/lms/has-access');
    return response.data;
  },

  // ==================== Results ====================

  async getMyResults(courseId) {
    const response = await api.get(`/lms/results/${courseId}`);
    return response.data;
  },

  async getAllMyResults() {
    const response = await api.get('/lms/results');
    return response.data;
  },

  // ==================== Attendance ====================

  async getMyAttendance(courseId) {
    const response = await api.get(`/lms/attendance/${courseId}`);
    return response.data;
  },

  async getAttendanceStats(courseId) {
    const response = await api.get(`/lms/attendance/${courseId}/stats`);
    return response.data;
  },

  // ==================== Certificates ====================

  async getMyCertificates() {
    const response = await api.get('/lms/certificates');
    return response.data;
  },

  async getCourseCertificate(courseId) {
    const response = await api.get(`/lms/certificates/${courseId}`);
    return response.data;
  },

  // ==================== Scholarships ====================

  async getMyScholarships() {
    const response = await api.get('/lms/scholarships');
    return response.data;
  },

  async getCourseScholarships(courseId) {
    const response = await api.get(`/lms/scholarships/${courseId}`);
    return response.data;
  },

  async getScholarshipDetails(scholarshipId) {
    const response = await api.get(`/lms/scholarships/${scholarshipId}/details`);
    return response.data;
  },

  // ==================== Attendance Reason ====================

  async submitAbsenceReason(attendanceId, reason) {
    const response = await api.post(`/lms/attendance/${attendanceId}/submit-reason`, {
      absence_reason: reason,
    });
    return response.data;
  },

  async getMyAttendanceCorrections(courseId) {
    const response = await api.get('/lms/attendance/corrections', {
      params: courseId ? { course_id: courseId } : {},
    });
    return response.data;
  },

  async requestAttendanceCorrection(attendanceId, reason, requestedStatus) {
    const response = await api.post(`/lms/attendance/${attendanceId}/corrections`, {
      reason,
      requested_status: requestedStatus,
    });
    return response.data;
  },

  // ==================== Course Materials ====================

  async getCourseMaterials(courseId) {
    const response = await api.get(`/lms/courses/${courseId}/materials`);
    return response.data;
  },

  // ==================== Assignments ====================

  async getCourseAssignments(courseId) {
    const response = await api.get(`/lms/courses/${courseId}/assignments`);
    return response.data;
  },

  async getMySubmission(assignmentId) {
    const response = await api.get(`/lms/assignments/${assignmentId}/submission`);
    return response.data;
  },

  async submitAssignment(assignmentId, data) {
    const response = await api.post(`/lms/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  // ==================== Live Sessions ====================

  async getCourseSessions(courseId) {
    const response = await api.get(`/lms/courses/${courseId}/sessions`);
    return response.data;
  },

  async getUpcomingSessions(courseId = null) {
    const params = courseId ? { course_id: courseId } : {};
    const response = await api.get('/lms/sessions/upcoming', { params });
    return response.data;
  },

  // ==================== Announcements ====================

  async getAnnouncements(courseId = null) {
    const params = courseId ? { course_id: courseId } : {};
    const response = await api.get('/lms/announcements', { params });
    return response.data;
  },

  // ==================== Payments ====================

  async getMyPayments() {
    const response = await api.get('/lms/payments');
    return response.data;
  },

  // ==================== Forum ====================

  async getForumPosts(courseId) {
    const response = await api.get(`/lms/courses/${courseId}/forum`);
    return response.data;
  },

  async getForumPost(postId) {
    const response = await api.get(`/lms/forum/posts/${postId}`);
    return response.data;
  },

  async getForumReplies(postId) {
    const response = await api.get(`/lms/forum/posts/${postId}/replies`);
    return response.data;
  },

  async createForumPost(data) {
    const response = await api.post('/lms/forum/posts', data);
    return response.data;
  },

  async voteForumPost(postId, voteType) {
    const response = await api.post(`/lms/forum/posts/${postId}/vote`, {
      vote_type: voteType,
    });
    return response.data;
  },

  // ==================== Student Dashboard ====================

  async getDashboard() {
    const response = await api.get('/lms/dashboard');
    return response.data;
  },

  // ==================== Performance Dashboard ====================

  async getPerformanceDashboard() {
    const response = await api.get('/lms/performance/dashboard');
    return response.data;
  },

  // ==================== Calendar Events ====================

  async getCalendarEvents(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get('/lms/calendar/events', { params });
    return response.data;
  },
};
