import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { useToast } from '../context/ToastContext';
import { lmsService } from '../services/lmsService';
import { courseService } from '../services/courseService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Breadcrumb from '../components/common/Breadcrumb';
import StudentDashboardLayout from '../components/layout/StudentDashboardLayout';
import { CardSkeleton, ListSkeleton } from '../components/common/Skeleton';
import { ErrorState, PermissionDenied } from '../components/common/DataState';
import { interpretApiError } from '../services/api';

function blockedSection(failure, onRetry) {
  if (!failure) return null;
  return failure.kind === 'denied'
    ? <PermissionDenied message={failure.message} />
    : <ErrorState message={failure.message} onRetry={onRetry} />;
}

async function optionalRequest(promise, fallback) {
  try {
    return { data: await promise, failure: null };
  } catch (error) {
    return { data: undefined, failure: await interpretApiError(error, fallback) };
  }
}

const CourseLMSDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBreadcrumbItems } = useBreadcrumb();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionFailures, setSectionFailures] = useState({});

  useEffect(() => {
    loadCourseData();
    
    // Cleanup breadcrumbs when component unmounts
    return () => {
      setBreadcrumbItems([]);
    };
  }, [id, setBreadcrumbItems]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [
        courseData,
        enrollmentsData,
        resultsData,
        attendanceData,
        statsData,
        certData,
        scholarshipsData,
        materialsData,
        assignmentsData,
        sessionsData,
        announcementsData,
        forumPostsData,
      ] = await Promise.all([
        courseService.getCourseById(id),
        lmsService.getMyEnrollments(),
        optionalRequest(lmsService.getMyResults(id), 'Failed to load results'),
        optionalRequest(lmsService.getMyAttendance(id), 'Failed to load attendance'),
        optionalRequest(lmsService.getAttendanceStats(id), 'Failed to load attendance'),
        optionalRequest(lmsService.getCourseCertificate(id), 'Failed to load the certificate'),
        optionalRequest(lmsService.getCourseScholarships(id), 'Failed to load scholarships'),
        optionalRequest(lmsService.getCourseMaterials(id), 'Failed to load lessons'),
        optionalRequest(lmsService.getCourseAssignments(id), 'Failed to load assignments'),
        optionalRequest(lmsService.getCourseSessions(id), 'Failed to load live classes'),
        optionalRequest(lmsService.getAnnouncements(id), 'Failed to load announcements'),
        optionalRequest(lmsService.getForumPosts(id), 'Failed to load discussion'),
      ]);

      setCourse(courseData);
      const myEnrollment = (enrollmentsData || []).find(e => e.course_id === id);
      setEnrollment(myEnrollment);
      
      // Update breadcrumbs with course title
      if (courseData) {
        setBreadcrumbItems([
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Courses', href: '/lms?section=enrollments' },
          { label: courseData.title, href: null }
        ]);
      }
      setResults(resultsData.failure ? [] : (resultsData.data || []));
      setAttendance(attendanceData.failure ? [] : (attendanceData.data || []));
      setAttendanceStats(statsData.failure ? null : statsData.data);
      setCertificate(certData.failure ? null : certData.data);
      setScholarships(scholarshipsData.failure ? [] : (scholarshipsData.data || []));
      setMaterials(materialsData.failure ? [] : (materialsData.data || []));
      setAssignments(assignmentsData.failure ? [] : (assignmentsData.data || []));
      setSessions(sessionsData.failure ? [] : (sessionsData.data || []));
      setAnnouncements(announcementsData.failure ? [] : (announcementsData.data || []));
      setForumPosts(forumPostsData.failure ? [] : (forumPostsData.data || []));
      setSectionFailures({
        results: resultsData.failure,
        attendance: attendanceData.failure || statsData.failure,
        certificate: certData.failure,
        scholarships: scholarshipsData.failure,
        materials: materialsData.failure,
        assignments: assignmentsData.failure,
        sessions: sessionsData.failure,
        announcements: announcementsData.failure,
        forum: forumPostsData.failure,
      });
      setError(null);
    } catch (err) {
      setError(await interpretApiError(err, 'Failed to load course data'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          <CardSkeleton />
          <div className="mt-6">
            <ListSkeleton items={5} />
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (!course) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          {error?.kind === 'denied' ? (
            <PermissionDenied message={error.message} />
          ) : (
            <ErrorState
              title={error ? 'Could not load this course' : 'Course not available'}
              message={error?.message || 'This course is not available. Return to My Courses and choose another course.'}
              onRetry={error ? loadCourseData : undefined}
            />
          )}
          <Button onClick={() => navigate('/lms?section=enrollments')} className="mt-4">Back to My Courses</Button>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (!enrollment || !enrollment.verified_by_admin) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <Breadcrumb />
          <Card>
            <div className="text-center py-8">
              <p className="text-amber-800 font-medium mb-2">LMS access requires admin-verified enrollment.</p>
              <p className="text-gray-600 mb-4">
                {enrollment
                  ? 'Your enrollment is pending payment verification. Please upload your payment receipt and wait for admin verification to access course content.'
                  : 'You need to enroll in this course and have your payment verified by an admin before accessing LMS content.'}
              </p>
              <Button onClick={() => navigate('/lms?section=enrollments')}>Back to My Courses</Button>
            </div>
          </Card>
        </div>
      </StudentDashboardLayout>
    );
  }

  const tabGroups = [
    { id: 'overview', label: 'Overview', items: [{ id: 'overview', label: 'Overview', icon: '📋' }] },
    { id: 'learning', label: 'Learning', items: [
      { id: 'materials', label: 'Lessons', icon: '📖' },
      { id: 'assignments', label: 'Assignments', icon: '📝' },
      { id: 'resources', label: 'Resources', icon: '📄' },
      { id: 'sessions', label: 'Live Classes', icon: '🎥' },
    ]},
    { id: 'discussion', label: 'Discussion', items: [
      { id: 'forum', label: 'Discussion', icon: '💬' },
      { id: 'announcements', label: 'Announcements', icon: '📢' },
    ]},
    { id: 'progress', label: 'Progress', items: [
      { id: 'results', label: 'Progress', icon: '📊' },
      { id: 'attendance', label: 'Attendance', icon: '✅' },
    ]},
    { id: 'records', label: 'Records', items: [
      { id: 'certificate', label: 'Certificate', icon: '🏆' },
      { id: 'scholarship', label: 'Scholarship', icon: '🎓' },
    ]},
  ];

  return (
    <StudentDashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Breadcrumb />
        {/* Course Header */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">{course.title}</h1>
              <p className="text-gray-600 break-words">{course.description}</p>
            </div>
            <Button onClick={() => navigate('/lms?section=enrollments')} className="bg-gray-500 hover:bg-gray-600 w-full sm:w-auto shrink-0">
              My Courses
            </Button>
          </div>
          {enrollment && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span>Status: <span className="font-semibold">{enrollment.status}</span></span>
              <span>Progress: <span className="font-semibold">{enrollment.progress_percentage?.toFixed?.(0) ?? 0}%</span></span>
              <span>Payment: <span className="font-semibold">{enrollment.payment_status}</span></span>
            </div>
          )}
        </Card>

        {error && (
          error.kind === 'denied'
            ? <PermissionDenied message={error.message} />
            : <ErrorState message={error.message} onRetry={loadCourseData} />
        )}

        {/* Grouped LMS Navigation */}
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:hidden -mx-1" aria-label="Course sections">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabGroups.flatMap((group) => group.items).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 min-h-11 px-3 rounded-full text-sm font-medium border ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
          <nav className="hidden lg:block lg:w-56 flex-shrink-0" aria-label="Course sections">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {tabGroups.map((group) => (
                <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {group.label}
                  </div>
                  {group.items.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition-colors
                        ${activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
        {activeTab === 'overview' && (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-2xl font-bold">Course Overview</h2>
              <Button onClick={() => setActiveTab('materials')}>Open lessons</Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Course Details</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Duration: {course.duration_hours} hours</li>
                  <li>Price: Rs. {course.price.toLocaleString()}</li>
                  <li>Instructor ID: {course.instructor_id}</li>
                </ul>
              </div>
              {enrollment && (
                <div>
                  <h3 className="font-semibold mb-2">Enrollment Information</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</li>
                    <li>Status: {enrollment.status}</li>
                    <li>Payment Status: {enrollment.payment_status}</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'results' && (
          <ResultsTab results={results} failure={sectionFailures.results} onRetry={loadCourseData} />
        )}

        {activeTab === 'materials' && (
          <MaterialsTab
            materials={materials.filter((material) => material.material_type !== 'link' && material.material_type !== 'assignment_instruction')}
            emptyMessage="No lessons have been added to this course yet. They appear here when an instructor publishes them."
            failure={sectionFailures.materials}
            onRetry={loadCourseData}
          />
        )}

        {activeTab === 'resources' && (
          <MaterialsTab
            materials={materials.filter((material) => material.material_type === 'link' || material.material_type === 'assignment_instruction')}
            emptyMessage="No resources have been added to this course yet. Links and assignment instructions show up here."
            failure={sectionFailures.materials}
            onRetry={loadCourseData}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab assignments={assignments} courseId={id} failure={sectionFailures.assignments} onRetry={loadCourseData} />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab sessions={sessions} failure={sectionFailures.sessions} onRetry={loadCourseData} />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTab attendance={attendance} stats={attendanceStats} courseId={id} failure={sectionFailures.attendance} onRetry={loadCourseData} />
        )}

        {activeTab === 'scholarship' && (
          <ScholarshipTab scholarships={scholarships} failure={sectionFailures.scholarships} onRetry={loadCourseData} />
        )}

        {activeTab === 'certificate' && (
          <CertificateTab certificate={certificate} course={course} failure={sectionFailures.certificate} onRetry={loadCourseData} />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab announcements={announcements} failure={sectionFailures.announcements} onRetry={loadCourseData} />
        )}

        {activeTab === 'forum' && (
          <ForumTab forumPosts={forumPosts} courseId={id} failure={sectionFailures.forum} onRetry={loadCourseData} />
        )}
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

// Results Tab Component
const ResultsTab = ({ results, failure, onRetry }) => {
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;
  if (results.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No progress has been recorded for this course yet.</p>
      </Card>
    );
  }

  const calculateAverage = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.percentage, 0);
    return (total / results.length).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold mb-2">Overall Performance</h3>
        <p className="text-2xl font-bold text-blue-600">Average: {calculateAverage()}%</p>
      </Card>
      {results.map((result) => (
        <Card key={result.id}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.assessment_name}</h3>
              <p className="text-sm text-gray-600 mb-2">Type: {result.assessment_type}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span>Marks: <span className="font-semibold">{result.marks_obtained}/{result.total_marks}</span></span>
                <span>Percentage: <span className="font-semibold">{result.percentage.toFixed(2)}%</span></span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  result.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                  result.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                  result.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Grade: {result.grade}
                </span>
              </div>
              {result.feedback && (
                <p className="mt-2 text-sm text-gray-600">Feedback: {result.feedback}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Attendance Tab Component
const AttendanceTab = ({ attendance, stats, failure, onRetry }) => {
  const toast = useToast();
  const [submittingReason, setSubmittingReason] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [loading, setLoading] = useState(false);
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;

  const handleSubmitReason = async (attendanceId) => {
    if (!reasonText.trim()) {
      toast.warning('Please provide a reason for your absence', { duration: 3000 });
      return;
    }
    try {
      setLoading(true);
      await lmsService.submitAbsenceReason(attendanceId, reasonText);
      setSubmittingReason(null);
      setReasonText('');
      toast.success('Absence reason submitted successfully!', { duration: 3000 });
      // Reload page data
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit reason', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  if (attendance.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No attendance records available yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {stats && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Attendance Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.present || 0}</p>
              <p className="text-sm text-gray-600">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent || 0}</p>
              <p className="text-sm text-gray-600">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.late || 0}</p>
              <p className="text-sm text-gray-600">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.excused || 0}</p>
              <p className="text-sm text-gray-600">Excused</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.percentage || 0}%</p>
              <p className="text-sm text-gray-600">Attendance %</p>
            </div>
          </div>
        </Card>
      )}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Attendance History</h3>
        <div className="space-y-4">
          {attendance.map((record) => (
            <div key={record.id} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                  {record.notes && (
                    <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {record.status}
                </span>
              </div>
              
              {/* Absence Reason Section */}
              {(record.status === 'absent' || record.status === 'late') && (
                <div className="mt-3 pt-3 border-t">
                  {record.absence_reason ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Absence Reason:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {record.absence_reason}
                      </p>
                      {record.absence_reason_submitted_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(record.absence_reason_submitted_at).toLocaleString()}
                        </p>
                      )}
                      {record.is_excused && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          ✓ Excused
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      {submittingReason === record.id ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Provide reason for absence:
                          </label>
                          <textarea
                            value={reasonText}
                            onChange={(e) => setReasonText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Please explain why you were absent..."
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSubmitReason(record.id)}
                              disabled={loading}
                              className="bg-blue-500 hover:bg-blue-600 text-sm"
                            >
                              {loading ? 'Submitting...' : 'Submit Reason'}
                            </Button>
                            <Button
                              onClick={() => {
                                setSubmittingReason(null);
                                setReasonText('');
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setSubmittingReason(record.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-sm"
                        >
                          Submit Absence Reason
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Materials Tab Component
const MaterialsTab = ({ materials, emptyMessage = 'No course materials available yet.', failure, onRetry }) => {
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;
  if (materials.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => (
          <Card key={material.id}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{material.title}</h3>
              {material.is_required && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded ml-2">Required</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{material.description}</p>
            <div className="text-xs text-gray-500 mb-3">
              <span>Type: {material.material_type}</span>
              {material.duration_minutes && (
                <span className="ml-2">• {material.duration_minutes} min</span>
              )}
            </div>
            {material.content_url && (
              <Button
                onClick={() => window.open(material.content_url, '_blank')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-sm"
              >
                {material.material_type === 'video' ? '▶ Watch' : '📄 Open'} Material
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

// Assignments Tab Component
const AssignmentsTab = ({ assignments, failure, onRetry }) => {
  const toast = useToast();
  const [submissions, setSubmissions] = useState({});
  const [showSubmit, setShowSubmit] = useState({});
  const [submissionText, setSubmissionText] = useState({});
  const [fileUrls, setFileUrls] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    if (failure) return;
    assignments.forEach(async (assignment) => {
      try {
        const submission = await lmsService.getMySubmission(assignment.id);
        setSubmissions(prev => ({ ...prev, [assignment.id]: submission }));
      } catch (err) {
        // No submission yet
      }
    });
  }, [assignments, failure]);

  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;

  const handleSubmit = async (assignmentId) => {
    const text = submissionText[assignmentId] || '';
    const files = fileUrls[assignmentId] || [];
    
    if (!text.trim() && files.length === 0) {
      toast.warning('Please provide submission text or files', { duration: 3000 });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [assignmentId]: true }));
      await lmsService.submitAssignment(assignmentId, {
        submission_text: text,
        file_urls: files,
      });
      const submission = await lmsService.getMySubmission(assignmentId);
      setSubmissions(prev => ({ ...prev, [assignmentId]: submission }));
      setShowSubmit(prev => ({ ...prev, [assignmentId]: false }));
      setSubmissionText(prev => ({ ...prev, [assignmentId]: '' }));
      setFileUrls(prev => ({ ...prev, [assignmentId]: [] }));
      toast.success('Assignment submitted successfully!', { duration: 3000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment', { duration: 4000 });
    } finally {
      setLoading(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  if (assignments.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No assignments available for this course.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const submission = submissions[assignment.id];
        const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
        
        return (
          <Card key={assignment.id}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  {isOverdue && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Overdue</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                {assignment.instructions && (
                  <p className="text-sm text-gray-500 mb-2">Instructions: {assignment.instructions}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                  <span>Type: {assignment.assignment_type}</span>
                  <span>Max Marks: {assignment.max_marks}</span>
                  {assignment.due_date && (
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                      Due: {new Date(assignment.due_date).toLocaleString()}
                    </span>
                  )}
                </div>
                
                {submission ? (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Submission</p>
                    <p className="text-sm text-gray-600">{submission.submission_text}</p>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                        submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status}
                      </span>
                      {submission.marks_obtained !== null && (
                        <span className="text-sm font-semibold">
                          Marks: {submission.marks_obtained}/{assignment.max_marks}
                        </span>
                      )}
                    </div>
                    {submission.feedback && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Feedback:</strong> {submission.feedback}
                      </p>
                    )}
                  </div>
                ) : (
                  !showSubmit[assignment.id] && (
                    <Button
                      onClick={() => setShowSubmit(prev => ({ ...prev, [assignment.id]: true }))}
                      className="mt-3 bg-blue-500 hover:bg-blue-600 text-sm"
                    >
                      Submit Assignment
                    </Button>
                  )
                )}
              </div>
            </div>
            
            {showSubmit[assignment.id] && !submission && (
              <div className="mt-4 p-4 border rounded">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Text
                </label>
                <textarea
                  value={submissionText[assignment.id] || ''}
                  onChange={(e) => setSubmissionText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your submission..."
                />
                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={() => handleSubmit(assignment.id)}
                    disabled={loading[assignment.id]}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {loading[assignment.id] ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSubmit(prev => ({ ...prev, [assignment.id]: false }));
                      setSubmissionText(prev => ({ ...prev, [assignment.id]: '' }));
                    }}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// Sessions Tab Component
const SessionsTab = ({ sessions, failure, onRetry }) => {
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;
  if (sessions.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No live sessions scheduled for this course.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const isUpcoming = new Date(session.start_time) > new Date();
        const isOngoing = new Date(session.start_time) <= new Date() && new Date(session.end_time) > new Date();
        
        return (
          <Card key={session.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.title}</h3>
                {session.description && (
                  <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                )}
                <div className="space-y-2 text-sm text-gray-600">
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
              {(isUpcoming || isOngoing) && session.meeting_link && (
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
  );
};

// Scholarship Tab Component
const ScholarshipTab = ({ scholarships, failure, onRetry }) => {
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;
  if (scholarships.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">No scholarships available for this course.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scholarships.map((scholarship) => {
        const remainingAbsences = scholarship.max_absences_per_month - scholarship.current_month_absences;
        
        return (
          <Card
            key={scholarship.id}
            className={scholarship.is_at_risk ? 'border-2 border-yellow-400 bg-yellow-50' : ''}
          >
            <div className="flex items-center space-x-2 mb-3">
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
              <div className="bg-red-50 border border-red-200 rounded p-3">
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
          </Card>
        );
      })}
    </div>
  );
};

// Certificate Tab Component
const CertificateTab = ({ certificate, course, failure, onRetry }) => {
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;
  if (!certificate) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Certificate not available yet.</p>
          <p className="text-sm text-gray-400">Complete the course to receive your certificate.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-300">
      <div className="text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Completion Certificate</h2>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{course.title}</h3>
        <div className="space-y-2 mb-6">
          <p className="text-sm text-gray-600">
            Certificate Number: <span className="font-mono font-semibold">{certificate.certificate_number}</span>
          </p>
          {certificate.grade && (
            <p className="text-sm text-gray-600">
              Grade: <span className="font-semibold">{certificate.grade}</span>
            </p>
          )}
          <p className="text-sm text-gray-600">
            Issued: {new Date(certificate.issue_date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Completed: {new Date(certificate.completion_date).toLocaleDateString()}
          </p>
        </div>
        {certificate.certificate_url ? (
          <Button
            onClick={() => window.open(certificate.certificate_url, '_blank')}
            className="bg-green-500 hover:bg-green-600"
          >
            Download Certificate PDF
          </Button>
        ) : (
          <p className="text-sm text-gray-500">Certificate PDF will be available soon</p>
        )}
        {certificate.is_verified && (
          <p className="mt-4 text-sm text-green-600">✓ Verified Certificate</p>
        )}
      </div>
    </Card>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ announcements, failure, onRetry }) => {
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;
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
        const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
        
        return (
          <Card
            key={announcement.id}
            className={announcement.priority === 'urgent' ? 'border-2 border-red-400 bg-red-50' :
                      announcement.priority === 'high' ? 'border-2 border-orange-400 bg-orange-50' :
                      ''}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    announcement.priority === 'urgent' ? 'bg-red-200 text-red-800' :
                    announcement.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                    announcement.priority === 'normal' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {announcement.priority}
                  </span>
                  {isExpired && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Expired</span>
                  )}
                </div>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {announcement.content}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {announcement.published_at && (
                    <span>Published: {new Date(announcement.published_at).toLocaleString()}</span>
                  )}
                  {announcement.expires_at && (
                    <span className="ml-4">
                      Expires: {new Date(announcement.expires_at).toLocaleString()}
                    </span>
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

// Forum Tab Component
const ForumTab = ({ forumPosts, courseId, failure, onRetry }) => {
  const toast = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(false);
  const blocked = blockedSection(failure, onRetry);
  if (blocked) return blocked;

  const loadReplies = async (postId) => {
    try {
      const repliesData = await lmsService.getForumReplies(postId);
      setReplies(prev => ({ ...prev, [postId]: repliesData }));
    } catch (err) {
      console.error('Failed to load replies:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.warning('Please provide both title and content', { duration: 3000 });
      return;
    }

    try {
      setLoading(true);
      await lmsService.createForumPost({
        course_id: courseId,
        title: newPostTitle,
        content: newPostContent,
        post_type: 'question',
      });
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
      toast.success('Post created successfully!', { duration: 3000 });
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      await lmsService.voteForumPost(postId, voteType);
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to vote', { duration: 4000 });
    }
  };

  if (selectedPost) {
    const postReplies = replies[selectedPost.id] || [];
    
    return (
      <div className="space-y-4">
        <Button onClick={() => setSelectedPost(null)} className="mb-4">
          ← Back to Forum
        </Button>
        
        <Card>
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">{selectedPost.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span>By: {selectedPost.author_name || 'Unknown'}</span>
              <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
            </div>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-4">
              {selectedPost.content}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote(selectedPost.id, 'upvote')}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              >
                <span>▲</span>
                <span>{selectedPost.upvotes || 0}</span>
              </button>
              <button
                onClick={() => handleVote(selectedPost.id, 'downvote')}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800"
              >
                <span>▼</span>
                <span>{selectedPost.downvotes || 0}</span>
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Replies ({postReplies.length})</h3>
          {postReplies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No replies yet.</p>
          ) : (
            <div className="space-y-4">
              {postReplies.map((reply) => (
                <div key={reply.id} className="border-l-4 border-blue-300 pl-4 py-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span className="font-medium">{reply.author_name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(reply.created_at).toLocaleString()}</span>
                  </div>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {reply.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Discussion Forum</h2>
        <Button
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
        >
          {showCreatePost ? 'Cancel' : '+ New Post'}
        </Button>
      </div>

      {showCreatePost && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Post content..."
            />
            <Button
              onClick={handleCreatePost}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </Card>
      )}

      {forumPosts.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No forum posts yet. Be the first to post!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {forumPosts.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                setSelectedPost(post);
                if (!replies[post.id]) {
                  loadReplies(post.id);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                    {post.is_pinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pinned</span>
                    )}
                    {post.is_resolved && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Resolved</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span>By: {post.author_name || 'Unknown'}</span>
                    <span>{new Date(post.created_at).toLocaleString()}</span>
                    <span>{post.reply_count || 0} replies</span>
                    <span>{post.views || 0} views</span>
                  </div>
                </div>
                <div className="flex flex-col items-center ml-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(post.id, 'upvote');
                    }}
                    className="min-h-11 min-w-11 text-blue-600 hover:text-blue-800"
                  >
                    ▲ {post.upvotes || 0}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(post.id, 'downvote');
                    }}
                    className="min-h-11 min-w-11 text-red-600 hover:text-red-800"
                  >
                    ▼ {post.downvotes || 0}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseLMSDetail;
