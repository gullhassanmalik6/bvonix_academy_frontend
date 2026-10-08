import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { lmsService } from '../services/lmsService';
import { downloadCardPreviewPdf, fetchPreviewCardData, openCardPreviewPdf } from '../utils/cardPreviewPdf';
import { courseService } from '../services/courseService';
import { siteSettingsService } from '../services/siteSettingsService';
import { getApiErrorMessage, getFileUrl, interpretApiError } from '../services/api';
import { DataState, ErrorState, PermissionDenied } from '../components/common/DataState';
import EnrollmentWizard from '../components/enrollment/EnrollmentWizard';
import { enrollmentWorkflowState, nextExpectedAction } from '../enrollment/enrollmentWizard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import CourseCatalogCard from '../components/courses/CourseCatalogCard';
import { getCourseCardTheme } from '../utils/courseCardTheme';
import StudentDashboardLayout from '../components/layout/StudentDashboardLayout';
import { lmsSectionTitle, lmsTabForSection } from '../navigation/studentNavigation';
import { CardSkeleton, StatCardSkeleton } from '../components/common/Skeleton';

const StudentLMS = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [payments, setPayments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);
  const [wizard, setWizard] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const section = searchParams.get('section');
    if (!section) return;
    const tab = lmsTabForSection(section);
    const known = ['dashboard', 'enrollments', 'available', 'scholarships', 'assignments', 'sessions', 'materials', 'forum', 'announcements', 'performance', 'attendance', 'calendar', 'payments', 'certificates'];
    if (known.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const enrollCourseId = searchParams.get('enroll');
    if (enrollCourseId && courses.length > 0) {
      const course = courses.find((c) => c.id === enrollCourseId);
      if (course) {
        const existing = enrollments.find((item) => item.course_id === course.id) || null;
        setWizard({ courseId: course.id, enrollment: existing });
        searchParams.delete('enroll');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [courses, enrollments, searchParams, setSearchParams]);

  const hasVerifiedEnrollment = enrollments.some((e) => e.verified_by_admin);
  useEffect(() => {
    if (loading) return;
    const restrictedTabs = ['dashboard', 'scholarships', 'assignments', 'sessions', 'materials', 'forum', 'announcements', 'performance', 'attendance', 'calendar', 'payments', 'certificates'];
    if (!hasVerifiedEnrollment && restrictedTabs.includes(activeTab)) {
      setActiveTab('enrollments');
      if (searchParams.get('section') && searchParams.get('section') !== 'enrollments' && searchParams.get('section') !== 'available') {
        const next = new URLSearchParams(searchParams);
        next.set('section', 'enrollments');
        setSearchParams(next, { replace: true });
      }
    }
  }, [hasVerifiedEnrollment, activeTab, loading, searchParams, setSearchParams]);

  const loadData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const [enrollmentsData, coursesData] = await Promise.all([
        lmsService.getMyEnrollments(),
        courseService.getCourses({ skip: 0, limit: 100, published_only: true }),
      ]);
      const enrollmentsList = enrollmentsData || [];
      setEnrollments(enrollmentsList);
      setCourses(coursesData?.items || []);
      const hasVerifiedEnrollment = enrollmentsList.some((e) => e.verified_by_admin);

      if (hasVerifiedEnrollment) {
        const [
          certificatesData,
          scholarshipsData,
          announcementsData,
          sessionsData,
          performanceData,
          paymentsData,
          calendarData,
        ] = await Promise.all([
          lmsService.getMyCertificates(),
          lmsService.getMyScholarships(),
          lmsService.getAnnouncements(),
          lmsService.getUpcomingSessions(),
          lmsService.getPerformanceDashboard(),
          lmsService.getMyPayments(),
          lmsService.getCalendarEvents(),
        ]);
        setCertificates(certificatesData || []);
        setScholarships(scholarshipsData || []);
        setAnnouncements(announcementsData || []);
        setUpcomingSessions(sessionsData || []);
        setPerformance(performanceData);
        setPayments(paymentsData || []);
        setCalendarEvents(calendarData || []);
      } else {
        setCertificates([]);
        setScholarships([]);
        setAnnouncements([]);
        setUpcomingSessions([]);
        setPerformance(null);
        setPayments([]);
        setCalendarEvents([]);
      }
      setFailure(null);
    } catch (err) {
      setFailure(await interpretApiError(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (courseId) => {
    const existing = enrollments.find((item) => item.course_id === courseId) || null;
    setWizard({ courseId, enrollment: existing });
  };

  const sectionKey = searchParams.get('section') || activeTab;
  const [pageTitle, pageSummary] = lmsSectionTitle(sectionKey);

  return (
    <StudentDashboardLayout>
      {loading ? (
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {pageTitle}
            </h1>
            <p className="text-gray-600 text-lg">
              {pageSummary}
            </p>
          </div>
          {failure ? (
            failure.kind === 'denied'
              ? <PermissionDenied message={failure.message} />
              : <ErrorState message={failure.message} onRetry={() => loadData()} />
          ) : (
          <>

          {!hasVerifiedEnrollment && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 font-medium">
                Complete your enrollment and wait for admin payment verification to access the full LMS.
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Enroll in a course, upload your payment receipt, and an admin will verify your payment. Once verified, you will have full access to course materials, assignments, and more.
              </p>
            </div>
          )}

        {hasVerifiedEnrollment && activeTab === 'dashboard' && (
          <DashboardTab
            enrollments={enrollments}
            scholarships={scholarships}
            announcements={announcements}
            upcomingSessions={upcomingSessions}
            performance={performance}
            courses={courses}
          />
        )}

        {activeTab === 'enrollments' && (
          <EnrollmentsTab
            enrollments={enrollments}
            courses={courses}
            onContinue={(enrollment) => setWizard({ courseId: enrollment.course_id, enrollment })}
          />
        )}

        {activeTab === 'available' && (
          <AvailableCoursesTab 
            courses={courses} 
            enrollments={enrollments}
            onEnroll={handleEnroll}
          />
        )}

        {hasVerifiedEnrollment && activeTab === 'scholarships' && (
          <ScholarshipsTab scholarships={scholarships} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'assignments' && (
          <AssignmentsTab enrollments={enrollments} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'sessions' && (
          <SessionsTab enrollments={enrollments} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'materials' && (
          <MaterialsTab enrollments={enrollments} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'announcements' && (
          <AnnouncementsTab announcements={announcements} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'forum' && (
          <ForumTab enrollments={enrollments} courses={courses} />
        )}

        {hasVerifiedEnrollment && (activeTab === 'performance' || activeTab === 'attendance') && (
          <PerformanceTab performance={performance} focus={activeTab} />
        )}

        {hasVerifiedEnrollment && activeTab === 'calendar' && (
          <CalendarTab events={calendarEvents} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'payments' && (
          <PaymentsTab payments={payments} courses={courses} />
        )}

        {hasVerifiedEnrollment && activeTab === 'certificates' && (
          <CertificatesTab certificates={certificates} courses={courses} />
        )}
          </>
          )}

          {/* Enrollment Modal */}
          {wizard && (
            <EnrollmentWizard
              courses={courses}
              enrollments={enrollments}
              initialCourseId={wizard.courseId}
              initialEnrollment={wizard.enrollment}
              onClose={() => setWizard(null)}
              onUpdated={() => loadData({ silent: true })}
            />
          )}
        </div>
      )}
    </StudentDashboardLayout>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ enrollments, scholarships, announcements, upcomingSessions, performance, courses }) => {
  const activeScholarships = scholarships.filter(s => s.status === 'active');
  const atRiskScholarships = scholarships.filter(s => s.is_at_risk);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{enrollments.length}</div>
            <div className="text-sm text-gray-600 mt-1">Enrolled Courses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {performance?.completed_courses || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Completed Courses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {performance?.overall_gpa || 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Overall GPA</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{activeScholarships.length}</div>
            <div className="text-sm text-gray-600 mt-1">Active Scholarships</div>
          </div>
        </Card>
      </div>

      {/* Scholarships Alert */}
      {atRiskScholarships.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-2">Scholarship At Risk</h3>
              <p className="text-sm text-yellow-700">
                You have {atRiskScholarships.length} scholarship(s) that are at risk of termination due to absences.
                Please submit absence reasons to maintain your scholarship.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Announcements</h2>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Upcoming Live Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map((session) => {
              const course = courses.find(c => c.id === session.course_id);
              return (
                <div key={session.id} className="border rounded p-3">
                  <h3 className="font-medium text-gray-900">{session.title}</h3>
                  {course && <p className="text-sm text-gray-600">{course.title}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(session.start_time).toLocaleString()}
                  </p>
                  {session.meeting_link && (
                    <Button
                      onClick={() => window.open(session.meeting_link, '_blank')}
                      className="mt-2 text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600"
                    >
                      Join Session
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

// Scholarships Tab Component
const ScholarshipsTab = ({ scholarships, courses }) => {
  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (scholarships.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">You don&apos;t have any scholarships.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scholarships.map((scholarship) => {
        const course = scholarship.course_id ? getCourseDetails(scholarship.course_id) : null;
        const remainingAbsences = scholarship.max_absences_per_month - scholarship.current_month_absences;

        return (
          <Card
            key={scholarship.id}
            className={scholarship.is_at_risk ? 'border-2 border-yellow-400 bg-yellow-50' : ''}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {scholarship.scholarship_type.replace('_', ' ').toUpperCase()} Scholarship
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    scholarship.status === 'active' ? 'bg-green-100 text-green-800' :
                    scholarship.status === 'terminated' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {scholarship.status}
                  </span>
                </div>
                {course && (
                  <p className="text-gray-600 mb-3">Course: {course.title}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-semibold">{scholarship.amount}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">This Month Absences:</span>
                    <span className={`ml-2 font-semibold ${
                      scholarship.current_month_absences >= scholarship.max_absences_per_month - 1
                        ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {scholarship.current_month_absences}/{scholarship.max_absences_per_month}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Remaining:</span>
                    <span className={`ml-2 font-semibold ${
                      remainingAbsences <= 1 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {remainingAbsences} absences
                    </span>
                  </div>
                  {scholarship.days_remaining !== null && (
                    <div>
                      <span className="text-gray-500">Days Remaining:</span>
                      <span className="ml-2 font-semibold">{scholarship.days_remaining}</span>
                    </div>
                  )}
                </div>
                {scholarship.is_at_risk && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-3">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Warning: You are at risk of scholarship termination. 
                      Please ensure you submit absence reasons for any absences.
                    </p>
                  </div>
                )}
                {scholarship.status === 'terminated' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                    <p className="text-sm text-red-800">
                      <strong>Terminated:</strong> {scholarship.termination_reason || 'No reason provided'}
                    </p>
                    {scholarship.terminated_at && (
                      <p className="text-xs text-red-600 mt-1">
                        Terminated on: {new Date(scholarship.terminated_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Assignments Tab Component
const AssignmentsTab = ({ enrollments, courses }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);

  const loadAssignments = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getCourseAssignments(selectedCourse);
      setAssignments(data || []);
      setFailure(null);
    } catch (err) {
      setAssignments([]);
      setFailure(await interpretApiError(err, 'Failed to load assignments'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments();
    }
  }, [selectedCourse, loadAssignments]);

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (enrollments.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">You are not enrolled in any courses yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full min-h-11 text-base px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a course --</option>
          {enrollments.map((enrollment) => {
            const course = getCourseDetails(enrollment.course_id);
            return course ? (
              <option key={enrollment.id} value={enrollment.course_id}>
                {course.title}
              </option>
            ) : null;
          })}
        </select>
      </Card>

      {selectedCourse && (
        loading ? (
          <div className="text-center py-8">Loading assignments...</div>
        ) : failure ? (
          <DataState status={failure.kind === 'denied' ? 'denied' : 'error'} message={failure.message} onRetry={loadAssignments} />
        ) : assignments.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No assignments have been published for this course yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} courseId={selectedCourse} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment }) => {
  const toast = useToast();
  const [submission, setSubmission] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSubmission = useCallback(async () => {
    try {
      const data = await lmsService.getMySubmission(assignment.id);
      setSubmission(data);
    } catch (err) {
      // No submission yet
    }
  }, [assignment.id]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await lmsService.submitAssignment(assignment.id, {
        submission_text: submissionText,
        file_urls: fileUrls,
      });
      await loadSubmission();
      setShowSubmit(false);
      toast.success('Assignment submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();

  return (
    <Card>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 break-words">{assignment.title}</h3>
          <p className="text-gray-600 text-sm mt-1 break-words">{assignment.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
            <span>Type: {assignment.assignment_type}</span>
            <span>Max Marks: {assignment.max_marks}</span>
            {assignment.due_date && (
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          {submission && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium text-gray-700">Your Submission</p>
              <p className="text-sm text-gray-600 mt-1">{submission.submission_text}</p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                  submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission.status}
                </span>
                {submission.marks_obtained !== null && (
                  <span className="ml-2 text-sm font-semibold">
                    Marks: {submission.marks_obtained}/{assignment.max_marks}
                  </span>
                )}
              </div>
              {submission.feedback && (
                <p className="text-sm text-gray-600 mt-2">Feedback: {submission.feedback}</p>
              )}
            </div>
          )}
        </div>
      </div>
      {!submission && (
        <Button
          onClick={() => setShowSubmit(!showSubmit)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Submit Assignment
        </Button>
      )}
      {showSubmit && (
        <div className="mt-4 p-4 border rounded">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submission Text
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            rows={5}
            className="w-full min-h-11 text-base px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your submission..."
          />
          <div className="mt-4 flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              onClick={() => setShowSubmit(false)}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Sessions Tab Component
const SessionsTab = ({ enrollments, courses }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);

  const loadSessions = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getCourseSessions(selectedCourse);
      setSessions(data || []);
      setFailure(null);
    } catch (err) {
      setSessions([]);
      setFailure(await interpretApiError(err, 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  const loadUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      const data = await lmsService.getUpcomingSessions();
      setSessions(data || []);
      setFailure(null);
    } catch (err) {
      setSessions([]);
      setFailure(await interpretApiError(err, 'Failed to load upcoming sessions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadSessions();
    } else {
      loadUpcoming();
    }
  }, [selectedCourse, loadSessions, loadUpcoming]);

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Course (or view all upcoming)
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value || null)}
          className="w-full min-h-11 text-base px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Upcoming Sessions</option>
          {enrollments.map((enrollment) => {
            const course = getCourseDetails(enrollment.course_id);
            return course ? (
              <option key={enrollment.id} value={enrollment.course_id}>
                {course.title}
              </option>
            ) : null;
          })}
        </select>
      </Card>

      {loading ? (
        <div className="text-center py-8">Loading sessions...</div>
      ) : failure ? (
        <DataState status={failure.kind === 'denied' ? 'denied' : 'error'} message={failure.message} onRetry={selectedCourse ? loadSessions : loadUpcoming} />
      ) : sessions.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No live classes are scheduled yet. Check again after your instructor adds a session.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const course = getCourseDetails(session.course_id);
            const isUpcoming = new Date(session.start_time) > new Date();
            
            return (
              <Card key={session.id}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                    {course && <p className="text-sm text-gray-600 mt-1">Course: {course.title}</p>}
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Start:</strong> {new Date(session.start_time).toLocaleString()}
                      </p>
                      <p>
                        <strong>End:</strong> {new Date(session.end_time).toLocaleString()}
                      </p>
                      <p>
                        <strong>Type:</strong> {session.session_type}
                      </p>
                      {session.location && (
                        <p><strong>Location:</strong> {session.location}</p>
                      )}
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    {session.recording_url && (
                      <Button
                        onClick={() => window.open(session.recording_url, '_blank')}
                        className="mt-3 bg-purple-500 hover:bg-purple-600 text-sm"
                      >
                        Watch Recording
                      </Button>
                    )}
                  </div>
                  {isUpcoming && session.meeting_link && (
                    <Button
                      onClick={() => window.open(session.meeting_link, '_blank')}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Join Session
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Materials Tab Component
const MaterialsTab = ({ enrollments, courses }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);

  const loadMaterials = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getCourseMaterials(selectedCourse);
      setMaterials(data || []);
      setFailure(null);
    } catch (err) {
      setMaterials([]);
      setFailure(await interpretApiError(err, 'Failed to load materials'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      loadMaterials();
    }
  }, [selectedCourse, loadMaterials]);

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (enrollments.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">You are not enrolled in any courses yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full min-h-11 text-base px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a course --</option>
          {enrollments.map((enrollment) => {
            const course = getCourseDetails(enrollment.course_id);
            return course ? (
              <option key={enrollment.id} value={enrollment.course_id}>
                {course.title}
              </option>
            ) : null;
          })}
        </select>
      </Card>

      {selectedCourse && (
        loading ? (
          <div className="text-center py-8">Loading materials...</div>
        ) : failure ? (
          <DataState status={failure.kind === 'denied' ? 'denied' : 'error'} message={failure.message} onRetry={loadMaterials} />
        ) : materials.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No resources have been added for this course yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{material.title}</h3>
                  {material.is_required && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{material.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  Type: {material.material_type}
                  {material.duration_minutes && ` • ${material.duration_minutes} min`}
                </div>
                {material.content_url && (
                  <Button
                    onClick={() => window.open(material.content_url, '_blank')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-sm"
                  >
                    {material.material_type === 'video' ? 'Watch' : 'Open'} Material
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ announcements, courses }) => {
  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (announcements.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No announcements available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const course = announcement.course_id ? getCourseDetails(announcement.course_id) : null;
        
        return (
          <Card
            key={announcement.id}
            className={
              announcement.priority === 'urgent' ? 'border-2 border-red-400 bg-red-50' :
              announcement.priority === 'high' ? 'border-2 border-orange-400 bg-orange-50' :
              ''
            }
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                announcement.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {announcement.priority}
              </span>
            </div>
            {course && (
              <p className="text-sm text-gray-600 mb-2">Course: {course.title}</p>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
            <p className="text-xs text-gray-500 mt-3">
              {new Date(announcement.published_at || announcement.created_at).toLocaleString()}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

// Forum Tab Component
const ForumTab = ({ enrollments, courses }) => {
  const toast = useToast();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const loadPosts = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getForumPosts(selectedCourse);
      setPosts(data || []);
      setFailure(null);
    } catch (err) {
      setPosts([]);
      setFailure(await interpretApiError(err, 'Failed to load discussion'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      loadPosts();
    }
  }, [selectedCourse, loadPosts]);

  const handleCreatePost = async () => {
    if (!selectedCourse || !newPostContent.trim()) return;
    try {
      await lmsService.createForumPost({
        course_id: selectedCourse,
        title: newPostTitle,
        content: newPostContent,
        post_type: 'question',
      });
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreate(false);
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    }
  };

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (enrollments.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">You are not enrolled in any courses yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Select Course
          </label>
          {selectedCourse && (
            <Button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-green-500 hover:bg-green-600 text-sm"
            >
              {showCreate ? 'Cancel' : 'New Question'}
            </Button>
          )}
        </div>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full min-h-11 text-base px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a course --</option>
          {enrollments.map((enrollment) => {
            const course = getCourseDetails(enrollment.course_id);
            return course ? (
              <option key={enrollment.id} value={enrollment.course_id}>
                {course.title}
              </option>
            ) : null;
          })}
        </select>
      </Card>

      {showCreate && selectedCourse && (
        <Card>
          <h3 className="font-semibold mb-3">Ask a Question</h3>
          <Input
            type="text"
            placeholder="Question title"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="mb-3"
          />
          <textarea
            placeholder="Your question..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          <Button
            onClick={handleCreatePost}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Post Question
          </Button>
        </Card>
      )}

      {selectedCourse && (
        loading ? (
          <div className="text-center py-8">Loading forum posts...</div>
        ) : failure ? (
          <DataState status={failure.kind === 'denied' ? 'denied' : 'error'} message={failure.message} onRetry={loadPosts} />
        ) : posts.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No forum posts yet. Be the first to ask a question!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className={post.is_pinned ? 'border-2 border-blue-400' : ''}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {post.is_pinned && <span className="text-xs text-blue-600 font-medium">📌 Pinned</span>}
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">By {post.author_name || 'Unknown'}</p>
                  </div>
                  {post.is_resolved && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Resolved</span>
                  )}
                </div>
                <p className="text-gray-700 mt-2">{post.content}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                  <span>👁️ {post.views} views</span>
                  <span>👍 {post.upvotes}</span>
                  <span>💬 {post.reply_count} replies</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <Button
                  onClick={() => window.location.href = `/lms/forum/${post.id}`}
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-sm"
                >
                  View & Reply
                </Button>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = ({ performance, focus = 'performance' }) => {
  if (!performance) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No performance has been recorded yet. Grades and attendance appear after they are saved.</p>
      </Card>
    );
  }

  if (focus === 'attendance') {
    const entries = Object.entries(performance.attendance_summary || {});
    if (entries.length === 0) {
      return (
        <Card>
          <p className="text-center text-gray-500 py-8">No attendance has been recorded yet.</p>
        </Card>
      );
    }

    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Attendance</h2>
        <div className="space-y-3">
          {entries.map(([courseId, summary]) => (
            <div key={courseId} className="border rounded p-3">
              <h3 className="font-medium text-gray-900 mb-2">{summary.course_title}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">{summary.present || 0}</div>
                  <div className="text-gray-600">Present</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{summary.absent || 0}</div>
                  <div className="text-gray-600">Absent</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{summary.late || 0}</div>
                  <div className="text-gray-600">Late</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{summary.excused || 0}</div>
                  <div className="text-gray-600">Excused</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{summary.percentage || 0}%</div>
                  <div className="text-gray-600">Total</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{performance.overall_gpa || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Overall GPA</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{performance.completed_courses || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Completed Courses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">{performance.active_courses || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Active Courses</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">{performance.total_courses || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Total Courses</div>
          </div>
        </Card>
      </div>

      {/* Course Performance */}
      {performance.course_performance && performance.course_performance.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Course-wise Performance</h2>
          <div className="space-y-3">
            {performance.course_performance.map((course, idx) => (
              <div key={idx} className="border rounded p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.course_title}</h3>
                    <p className="text-sm text-gray-600">
                      {course.total_assessments} assessments • Status: {course.enrollment_status}
                    </p>
                  </div>
                  <div className="sm:text-right sm:ml-4">
                    <div className="text-2xl font-bold text-blue-600">{course.average_percentage}%</div>
                    <div className="text-sm text-gray-600">Grade: {course.final_grade}</div>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(course.average_percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grade Distribution */}
      {performance.grade_distribution && Object.keys(performance.grade_distribution).length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Grade Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(performance.grade_distribution).map(([grade, count]) => (
              <div key={grade} className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{grade}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Results */}
      {performance.recent_results && performance.recent_results.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
          <div className="space-y-2">
            {performance.recent_results.map((result) => (
              <div key={result.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{result.assessment_name}</p>
                    <p className="text-sm text-gray-600">
                      {result.assessment_type} • {new Date(result.issued_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">{result.percentage}%</div>
                    <p className="text-sm text-gray-600">Grade: {result.grade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Calendar Tab Component
const CalendarTab = ({ events, courses }) => {
  const getCourseName = (courseId) => {
    if (!courseId) return 'System-wide';
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
  };

  const getEventColor = (eventType) => {
    const colors = {
      class: 'bg-blue-100 border-blue-300',
      assignment_due: 'bg-red-100 border-red-300',
      exam: 'bg-purple-100 border-purple-300',
      live_session: 'bg-green-100 border-green-300',
      announcement: 'bg-yellow-100 border-yellow-300',
      holiday: 'bg-gray-100 border-gray-300',
    };
    return colors[eventType] || 'bg-gray-100 border-gray-300';
  };

  const getEventIcon = (eventType) => {
    const icons = {
      class: '📚',
      assignment_due: '📝',
      exam: '📊',
      live_session: '🎥',
      announcement: '📢',
      holiday: '🎉',
    };
    return icons[eventType] || '📅';
  };

  // Group events by date
  const eventsByDate = {};
  events.forEach(event => {
    const date = new Date(event.start_time).toDateString();
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });

  const sortedDates = Object.keys(eventsByDate).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  if (events.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No calendar events scheduled.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map(date => (
        <Card key={date}>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <div className="space-y-3">
            {eventsByDate[date].map(event => (
              <div
                key={event.id}
                className={`border-l-4 rounded p-4 ${getEventColor(event.event_type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                      <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                      <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Time:</strong>{' '}
                        {event.is_all_day 
                          ? 'All Day'
                          : `${new Date(event.start_time).toLocaleTimeString()}${event.end_time ? ` - ${new Date(event.end_time).toLocaleTimeString()}` : ''}`
                        }
                      </p>
                      {event.location && (
                        <p><strong>Location:</strong> {event.location}</p>
                      )}
                      {event.meeting_link && (
                        <p>
                          <strong>Meeting:</strong>{' '}
                          <a 
                            href={event.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </p>
                      )}
                      <p><strong>Course:</strong> {getCourseName(event.course_id)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

// Payments Tab Component
const PaymentsTab = ({ payments, courses }) => {
  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (payments.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No payment records found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const course = payment.course_id ? getCourseDetails(payment.course_id) : null;
        
        return (
          <Card key={payment.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {course ? course.title : 'General Payment'}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payment.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {payment.payment_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-semibold">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </span>
                  </div>
                  {payment.scholarship_discount > 0 && (
                    <div>
                      <span className="text-gray-500">Discount:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        -{payment.scholarship_discount}%
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-2">{payment.payment_method}</span>
                  </div>
                  {payment.invoice_number && (
                    <div>
                      <span className="text-gray-500">Invoice:</span>
                      <span className="ml-2 font-mono text-xs">{payment.invoice_number}</span>
                    </div>
                  )}
                </div>
                {payment.payment_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    Paid on: {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                )}
                {payment.invoice_url && (
                  <Button
                    onClick={() => window.open(payment.invoice_url, '_blank')}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-sm"
                  >
                    Download Invoice
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Enrollments Tab Component
const EnrollmentsTab = ({ enrollments, courses, onContinue }) => {
  const toast = useToast();
  const [cardActionLoading, setCardActionLoading] = useState(null);

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  const handleViewCard = async (enrollmentId) => {
    try {
      setCardActionLoading(`${enrollmentId}-view`);
      const cardData = await fetchPreviewCardData(enrollmentId);
      await openCardPreviewPdf(cardData);
    } catch (err) {
      toast.error(
        err.message || err.response?.data?.detail || err.response?.data?.message || 'Failed to view enrollment card.'
      );
    } finally {
      setCardActionLoading(null);
    }
  };

  const handleDownloadCard = async (enrollmentId) => {
    try {
      setCardActionLoading(`${enrollmentId}-download`);
      const cardData = await fetchPreviewCardData(enrollmentId);
      await downloadCardPreviewPdf(
        cardData,
        `enrollment_card_${cardData.studentId || enrollmentId}.pdf`
      );
      toast.success('Card PDF downloaded');
    } catch (err) {
      toast.error(err?.message || (await getApiErrorMessage(err, 'Failed to download enrollment card.')));
    } finally {
      setCardActionLoading(null);
    }
  };

  if (enrollments.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">You are not enrolled in any courses yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => {
        const course = getCourseDetails(enrollment.course_id);
        if (!course) return null;

        return (
          <Card key={enrollment.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-500">
                  <span>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                  <span>Progress: {enrollment.progress_percentage.toFixed(0)}%</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                    enrollment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {enrollment.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    enrollment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Payment: {enrollment.payment_status}
                  </span>
                </div>
                {enrollment.enrollment_card_number && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Enrollment Card Number: <span className="font-mono">{enrollment.enrollment_card_number}</span>
                    </p>
                    {enrollment.verified_by_admin ? (
                      <p className="text-xs text-green-700">✓ Verified by Admin</p>
                    ) : (
                      <p className="text-xs text-yellow-700">⏳ Waiting for admin verification</p>
                    )}
                  </div>
                )}

                {!['active', 'completed', 'cancelled', 'refunded'].includes(enrollmentWorkflowState(enrollment)) && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-900 mb-2">{nextExpectedAction(enrollment)}</p>
                    <Button
                      onClick={() => onContinue(enrollment)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-sm px-3 py-1"
                    >
                      Continue enrollment
                    </Button>
                  </div>
                )}

                {enrollment.payment_receipt_url && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-medium text-green-900 mb-2">
                      ✓ Payment Receipt Uploaded
                    </p>
                    <Button
                      onClick={() => window.open(getFileUrl(enrollment.payment_receipt_url), '_blank')}
                      className="bg-green-500 hover:bg-green-600 text-sm px-3 py-1"
                    >
                      View Receipt
                    </Button>
                    {!enrollment.verified_by_admin && (
                      <p className="text-xs text-green-700 mt-2">Waiting for admin to verify your payment receipt</p>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => window.location.href = `/lms/course/${enrollment.course_id}`}
                    className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-1"
                  >
                    View Details
                  </Button>
                  {enrollment.verified_by_admin && (
                    <>
                      <Link
                        to={`/card-preview/${enrollment.id}`}
                        className="inline-flex items-center justify-center min-h-11 bg-violet-600 hover:bg-violet-700 text-white text-sm px-3 rounded-lg text-center"
                      >
                        Preview Card
                      </Link>
                      <Button
                        onClick={() => handleViewCard(enrollment.id)}
                        disabled={cardActionLoading === `${enrollment.id}-view`}
                        className="bg-indigo-500 hover:bg-indigo-600 text-sm px-3 py-1"
                      >
                        {cardActionLoading === `${enrollment.id}-view` ? 'Opening...' : 'View PDF'}
                      </Button>
                      <Button
                        onClick={() => handleDownloadCard(enrollment.id)}
                        disabled={cardActionLoading === `${enrollment.id}-download`}
                        className="bg-green-500 hover:bg-green-600 text-sm px-3 py-1"
                      >
                        {cardActionLoading === `${enrollment.id}-download` ? 'Downloading...' : 'Download PDF'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Available Courses Tab Component
const AvailableCoursesTab = ({ courses, enrollments, onEnroll }) => {
  const [subjectItems, setSubjectItems] = useState([]);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => setSubjectItems(data?.subjects_items || []))
      .catch(() => setSubjectItems(siteSettingsService.SUBJECTS_DEFAULTS?.subjects_items || []));
  }, []);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const availableCourses = courses.filter((course) => !enrolledCourseIds.has(course.id));

  if (availableCourses.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl bg-gray-50 border border-gray-100">
        <p className="text-gray-600 text-lg font-medium">You&apos;re enrolled in all available courses.</p>
        <p className="text-gray-500 text-sm mt-2">Check back later for new programs, or view your enrollments.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-primary-500 font-bold uppercase tracking-wider text-sm mb-2">
          Explore Programs
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Available Courses
        </h2>
        <p className="text-gray-600 max-w-2xl">
          Industry-ready programs with hands-on projects, internship support, and career guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 pl-8 sm:pl-10">
        {availableCourses.map((course, index) => (
          <CourseCatalogCard
            key={course.id}
            course={course}
            theme={getCourseCardTheme(course, index, subjectItems)}
            mode="enroll"
            onEnroll={onEnroll}
          />
        ))}
      </div>
    </div>
  );
};

// Certificates Tab Component (keeping existing)
const CertificatesTab = ({ certificates, courses }) => {
  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  if (certificates.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">You don&apos;t have any certificates yet. Finish a course and an administrator can issue one.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {certificates.map((certificate) => {
        const course = getCourseDetails(certificate.course_id);
        if (!course) return null;

        return (
          <Card key={certificate.id} className="border-2 border-yellow-300">
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3">
                Certificate Number: <span className="font-mono font-semibold">{certificate.certificate_number}</span>
              </p>
              {certificate.grade && (
                <p className="text-sm text-gray-600 mb-3">Grade: <span className="font-semibold">{certificate.grade}</span></p>
              )}
              <p className="text-xs text-gray-500 mb-4">
                Issued: {new Date(certificate.issue_date).toLocaleDateString()}
              </p>
              {certificate.certificate_url && (
                <Button
                  onClick={() => window.open(certificate.certificate_url, '_blank')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Download Certificate
                </Button>
              )}
              {!certificate.certificate_url && (
                <p className="text-sm text-gray-500">Certificate will be available soon</p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};



export default StudentLMS;
