import api from './api';

function isPage(data) {
  return Boolean(data && Array.isArray(data.items) && typeof data.total === 'number');
}

/** Walk skip/limit pages and return the complete array. Each HTTP response stays at most 100 rows. */
async function collectPaged(path, params = {}) {
  const limit = 100;
  let skip = 0;
  let items = [];
  let more = true;
  while (more) {
    const { data } = await api.get(path, { params: { ...params, skip, limit } });
    if (!isPage(data)) return data;
    const page = data.items;
    items = items.concat(page);
    if (page.length === 0 || skip + page.length >= data.total) {
      more = false;
      return items;
    }
    skip += page.length;
  }
}

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
    return collectPaged('/lms/enrollments');
  },

  async checkLMSAccess() {
    const response = await api.get('/lms/has-access');
    return response.data;
  },

  // ==================== Results ====================

  async getMyResults(courseId) {
    return collectPaged(`/lms/results/${courseId}`);
  },

  async getAllMyResults() {
    const items = await collectPaged('/lms/results');
    const grouped = {};
    for (const result of items) {
      const key = result.enrollment_id || result.course_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(result);
    }
    return grouped;
  },

  // ==================== Attendance ====================

  async getMyAttendance(courseId) {
    return collectPaged(`/lms/attendance/${courseId}`);
  },

  async getAttendanceStats(courseId) {
    const response = await api.get(`/lms/attendance/${courseId}/stats`);
    return response.data;
  },

  // ==================== Certificates ====================

  async getMyCertificates() {
    return collectPaged('/lms/certificates');
  },

  async getCourseCertificate(courseId) {
    const response = await api.get(`/lms/certificates/${courseId}`);
    return response.data;
  },

  // ==================== Scholarships ====================

  async getMyScholarships() {
    return collectPaged('/lms/scholarships');
  },

  async getCourseScholarships(courseId) {
    return collectPaged(`/lms/scholarships/${courseId}`);
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
    return collectPaged(`/lms/courses/${courseId}/materials`);
  },

  // ==================== Assignments ====================

  async getCourseAssignments(courseId) {
    return collectPaged(`/lms/courses/${courseId}/assignments`);
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
    return collectPaged(`/lms/courses/${courseId}/sessions`);
  },

  async getUpcomingSessions(courseId = null) {
    const params = courseId ? { course_id: courseId } : {};
    return collectPaged('/lms/sessions/upcoming', params);
  },

  // ==================== Announcements ====================

  async getAnnouncements(courseId = null) {
    const params = courseId ? { course_id: courseId } : {};
    return collectPaged('/lms/announcements', params);
  },

  // ==================== Payments ====================

  async getMyPayments() {
    return collectPaged('/lms/payments');
  },

  // ==================== Forum ====================

  async getForumPosts(courseId) {
    return collectPaged(`/lms/courses/${courseId}/forum`);
  },

  async getForumPost(postId) {
    const response = await api.get(`/lms/forum/posts/${postId}`);
    return response.data;
  },

  async getForumReplies(postId) {
    return collectPaged(`/lms/forum/posts/${postId}/replies`);
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
    const limit = 100;
    let skip = 0;
    let enrollments = [];
    const mentors = new Map();
    let total = 0;
    let more = true;
    while (more) {
      const { data } = await api.get('/lms/dashboard', { params: { skip, limit } });
      const page = data?.enrollments || [];
      total = typeof data?.total === 'number' ? data.total : page.length;
      enrollments = enrollments.concat(page);
      for (const mentor of data?.mentors || []) {
        if (mentor?.id) mentors.set(mentor.id, mentor);
      }
      if (skip + limit >= total) {
        more = false;
        return { enrollments, mentors: [...mentors.values()], total };
      }
      skip += limit;
    }
  },

  // ==================== Performance Dashboard ====================

  async getPerformanceDashboard() {
    const limit = 100;
    let skip = 0;
    let merged = null;
    let more = true;
    while (more) {
      const { data } = await api.get('/lms/performance/dashboard', { params: { skip, limit } });
      if (!merged) {
        merged = {
          ...data,
          course_performance: [],
          attendance_summary: {},
        };
      }
      merged.course_performance.push(...(data.course_performance || []));
      Object.assign(merged.attendance_summary, data.attendance_summary || {});
      const total = data.total_courses ?? 0;
      if (skip + limit >= total) {
        more = false;
        return merged;
      }
      skip += limit;
    }
  },

  // ==================== Calendar Events ====================

  async getCalendarEvents(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return collectPaged('/lms/calendar/events', params);
  },
};
