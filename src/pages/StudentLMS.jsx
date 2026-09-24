import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { lmsService } from '../services/lmsService';
import { courseService } from '../services/courseService';
import { siteSettingsService } from '../services/siteSettingsService';
import { uploadService } from '../services/uploadService';
import { getApiErrorMessage, getFileUrl } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import CourseCatalogCard from '../components/courses/CourseCatalogCard';
import { getCourseCardTheme } from '../utils/courseCardTheme';
import DashboardLayout from '../components/layout/DashboardLayout';
import { CardSkeleton, StatCardSkeleton, ListSkeleton, NotificationSkeleton } from '../components/common/Skeleton';

const StudentLMS = () => {
  const { user } = useAuth();
  const toast = useToast();
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
  const [error, setError] = useState(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    class_type: 'online',
    phone_number: '',
    address: '',
    father_guardian_name: '',
    date_of_birth: '',
    gender: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    profile_image_url: null,
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const enrollCourseId = searchParams.get('enroll');
    if (enrollCourseId && courses.length > 0) {
      const course = courses.find((c) => c.id === enrollCourseId);
      if (course) {
        setSelectedCourse(course);
        setShowEnrollmentModal(true);
        searchParams.delete('enroll');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [courses, searchParams, setSearchParams]);

  const hasVerifiedEnrollment = enrollments.some((e) => e.verified_by_admin);
  useEffect(() => {
    const restrictedTabs = ['dashboard', 'scholarships', 'assignments', 'sessions', 'materials', 'forum', 'announcements', 'performance', 'calendar', 'payments', 'certificates'];
    if (!hasVerifiedEnrollment && restrictedTabs.includes(activeTab)) {
      setActiveTab('enrollments');
    }
  }, [hasVerifiedEnrollment, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
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
          lmsService.getPerformanceDashboard().catch(() => null),
          lmsService.getMyPayments(),
          lmsService.getCalendarEvents().catch(() => []),
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
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    // Open enrollment modal for this course
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setShowEnrollmentModal(true);
    }
  };

  const handleEnrollmentSubmit = async () => {
    if (!selectedCourse) return;

    // Validate required fields
    if (!enrollmentFormData.class_type) {
      toast.error('Please select a class type', { duration: 3000 });
      return;
    }

    if (!enrollmentFormData.phone_number) {
      toast.error('Please enter your phone number', { duration: 3000 });
      return;
    }

    if (!enrollmentFormData.father_guardian_name?.trim()) {
      toast.error('Please enter father / guardian name', { duration: 3000 });
      return;
    }

    if (!enrollmentFormData.date_of_birth) {
      toast.error('Please enter your date of birth', { duration: 3000 });
      return;
    }

    if (!enrollmentFormData.gender) {
      toast.error('Please select your gender', { duration: 3000 });
      return;
    }

    if (!profileImageFile) {
      toast.error('Please upload a passport-size profile photo', { duration: 3000 });
      return;
    }

    if (enrollmentFormData.class_type === 'physical' && !enrollmentFormData.address) {
      toast.error('Please enter your address for physical classes', { duration: 3000 });
      return;
    }

    try {
      // Upload profile image if provided
      let profileImageUrl = null;
      if (profileImageFile) {
        try {
          const uploadResponse = await uploadService.uploadProfileImage(profileImageFile);
          profileImageUrl = uploadResponse.url || uploadResponse.file_url || uploadResponse.profile_image_url;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('Failed to upload profile image. Please try again.', { duration: 4000 });
          return;
        }
      }

      // Prepare enrollment data
      const enrollmentData = {
        class_type: enrollmentFormData.class_type,
        phone_number: enrollmentFormData.phone_number || null,
        address: enrollmentFormData.address || null,
        father_guardian_name: enrollmentFormData.father_guardian_name || null,
        date_of_birth: enrollmentFormData.date_of_birth || null,
        gender: enrollmentFormData.gender || null,
        emergency_contact_name: enrollmentFormData.emergency_contact_name || null,
        emergency_contact_phone: enrollmentFormData.emergency_contact_phone || null,
        profile_image_url: profileImageUrl,
        payment_status: 'pending',
      };

      await lmsService.enrollInCourse(selectedCourse.id, enrollmentData);
      await loadData();
      
      // Reset form and close modal
      setShowEnrollmentModal(false);
      setSelectedCourse(null);
      setEnrollmentFormData({
        class_type: 'online',
        phone_number: '',
        address: '',
        father_guardian_name: '',
        date_of_birth: '',
        gender: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        profile_image_url: null,
      });
      setProfileImageFile(null);
      setProfileImagePreview(null);
      
      toast.success('Successfully enrolled in course!', { duration: 3000 });
    } catch (err) {
      console.error('Enrollment error:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to enroll. Please check your connection and try again.';
      toast.error(errorMessage, { duration: 5000 });
    }
  };

  const menuItems = hasVerifiedEnrollment
    ? [
        {
          group: 'Overview',
          items: [
            { id: 'dashboard', label: 'Dashboard', onClick: () => setActiveTab('dashboard'), activeTab },
          ]
        },
        {
          group: 'Courses',
          items: [
            { id: 'enrollments', label: 'My Courses', onClick: () => setActiveTab('enrollments'), activeTab },
            { id: 'available', label: 'Available Courses', onClick: () => setActiveTab('available'), activeTab },
            { id: 'scholarships', label: 'Scholarships', onClick: () => setActiveTab('scholarships'), activeTab },
          ]
        },
        {
          group: 'Learning',
          items: [
            { id: 'assignments', label: 'Assignments', onClick: () => setActiveTab('assignments'), activeTab },
            { id: 'sessions', label: 'Live Sessions', onClick: () => setActiveTab('sessions'), activeTab },
            { id: 'materials', label: 'Course Materials', onClick: () => setActiveTab('materials'), activeTab },
            { id: 'forum', label: 'Forum', onClick: () => setActiveTab('forum'), activeTab },
          ]
        },
        {
          group: 'Activities',
          items: [
            { id: 'announcements', label: 'Announcements', onClick: () => setActiveTab('announcements'), activeTab },
            { id: 'performance', label: 'Performance', onClick: () => setActiveTab('performance'), activeTab },
            { id: 'calendar', label: 'Calendar', onClick: () => setActiveTab('calendar'), activeTab },
          ]
        },
        {
          group: 'Account',
          items: [
            { id: 'payments', label: 'Payments', onClick: () => setActiveTab('payments'), activeTab },
            { id: 'certificates', label: 'Certificates', onClick: () => setActiveTab('certificates'), activeTab },
          ]
        },
      ]
    : [
        {
          group: 'Enrollment',
          items: [
            { id: 'enrollments', label: 'My Enrollments', onClick: () => setActiveTab('enrollments'), activeTab },
            { id: 'available', label: 'Available Courses', onClick: () => setActiveTab('available'), activeTab },
          ]
        },
      ];

  return (
    <DashboardLayout menuItems={menuItems} title="LMS">
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
              My LMS
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, <span className="text-blue-600 font-semibold">{user?.full_name || user?.email}</span>!
            </p>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

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
          <EnrollmentsTab enrollments={enrollments} courses={courses} />
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

        {hasVerifiedEnrollment && activeTab === 'performance' && (
          <PerformanceTab performance={performance} courses={courses} />
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

          {/* Enrollment Modal */}
          {showEnrollmentModal && selectedCourse && (
            <EnrollmentModal
              course={selectedCourse}
              formData={enrollmentFormData}
              setFormData={setEnrollmentFormData}
              profileImageFile={profileImageFile}
              setProfileImageFile={setProfileImageFile}
              profileImagePreview={profileImagePreview}
              setProfileImagePreview={setProfileImagePreview}
              onClose={() => {
                setShowEnrollmentModal(false);
                setSelectedCourse(null);
                setProfileImageFile(null);
                setProfileImagePreview(null);
              }}
              onSubmit={handleEnrollmentSubmit}
            />
          )}
        </div>
      )}
    </DashboardLayout>
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
        <p className="text-center text-gray-500 py-8">You don't have any scholarships.</p>
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

  useEffect(() => {
    if (selectedCourse) {
      loadAssignments();
    }
  }, [selectedCourse]);

  const loadAssignments = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getCourseAssignments(selectedCourse);
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        ) : assignments.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No assignments available for this course.</p>
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
const AssignmentCard = ({ assignment, courseId }) => {
  const [submission, setSubmission] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, [assignment.id]);

  const loadSubmission = async () => {
    try {
      const data = await lmsService.getMySubmission(assignment.id);
      setSubmission(data);
    } catch (err) {
      // No submission yet
    }
  };

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
          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

  useEffect(() => {
    if (selectedCourse) {
      loadSessions();
    } else {
      loadUpcoming();
    }
  }, [selectedCourse]);

  const loadSessions = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getCourseSessions(selectedCourse);
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcoming = async () => {
    try {
      setLoading(true);
      const data = await lmsService.getUpcomingSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load upcoming sessions:', err);
    } finally {
      setLoading(false);
    }
  };

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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      ) : sessions.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No sessions available.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const course = getCourseDetails(session.course_id);
            const isUpcoming = new Date(session.start_time) > new Date();
            
            return (
              <Card key={session.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
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

  useEffect(() => {
    if (selectedCourse) {
      loadMaterials();
    }
  }, [selectedCourse]);

  const loadMaterials = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getCourseMaterials(selectedCourse);
      setMaterials(data || []);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        ) : materials.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No materials available for this course.</p>
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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    if (selectedCourse) {
      loadPosts();
    }
  }, [selectedCourse]);

  const loadPosts = async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);
      const data = await lmsService.getForumPosts(selectedCourse);
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load forum posts:', err);
    } finally {
      setLoading(false);
    }
  };

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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
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
const PerformanceTab = ({ performance, courses }) => {
  if (!performance) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-8">Loading performance data...</p>
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
                <div className="flex justify-between items-center mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.course_title}</h3>
                    <p className="text-sm text-gray-600">
                      {course.total_assessments} assessments • Status: {course.enrollment_status}
                    </p>
                  </div>
                  <div className="text-right ml-4">
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

      {/* Attendance Summary */}
      {performance.attendance_summary && Object.keys(performance.attendance_summary).length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Attendance Summary</h2>
          <div className="space-y-3">
            {Object.entries(performance.attendance_summary).map(([courseId, summary]) => (
              <div key={courseId} className="border rounded p-3">
                <h3 className="font-medium text-gray-900 mb-2">{summary.course_title}</h3>
                <div className="grid grid-cols-5 gap-2 text-sm">
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
const EnrollmentsTab = ({ enrollments, courses }) => {
  const toast = useToast();
  const [uploadingReceipt, setUploadingReceipt] = useState({});
  const [receiptFile, setReceiptFile] = useState({});
  const [cardActionLoading, setCardActionLoading] = useState(null);

  const getCourseDetails = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  const handleViewCard = async (enrollmentId) => {
    try {
      setCardActionLoading(`${enrollmentId}-view`);
      await lmsService.viewEnrollmentCard(enrollmentId);
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
      await lmsService.downloadEnrollmentCard(enrollmentId);
    } catch (err) {
      toast.error(await getApiErrorMessage(err, 'Failed to download enrollment card.'));
    } finally {
      setCardActionLoading(null);
    }
  };

  const handleReceiptUpload = async (enrollmentId) => {
    const file = receiptFile[enrollmentId];
    if (!file) {
      toast.warning('Please select a payment receipt file');
      return;
    }

    try {
      setUploadingReceipt(prev => ({ ...prev, [enrollmentId]: true }));
      // Upload receipt
      const uploadResult = await uploadService.uploadPaymentReceipt(file);
      // Update enrollment with receipt URL
      await lmsService.uploadPaymentReceipt(enrollmentId, uploadResult.url);
      setReceiptFile(prev => ({ ...prev, [enrollmentId]: null }));
      toast.success('Payment receipt uploaded successfully! Admin will verify your payment.');
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload payment receipt');
    } finally {
      setUploadingReceipt(prev => ({ ...prev, [enrollmentId]: false }));
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
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
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

                {/* Payment Receipt Upload Section */}
                {enrollment.payment_status === 'pending' && !enrollment.payment_receipt_url && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-medium text-yellow-900 mb-2">
                      Upload Payment Receipt
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setReceiptFile(prev => ({ ...prev, [enrollment.id]: e.target.files[0] }))}
                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <Button
                        onClick={() => handleReceiptUpload(enrollment.id)}
                        disabled={uploadingReceipt[enrollment.id] || !receiptFile[enrollment.id]}
                        className="bg-yellow-500 hover:bg-yellow-600 text-sm px-3 py-1"
                      >
                        {uploadingReceipt[enrollment.id] ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">Upload receipt after completing payment (Image or PDF, max 10MB)</p>
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
                        className="inline-block bg-violet-600 hover:bg-violet-700 text-white text-sm px-3 py-1 rounded-lg text-center"
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
        <p className="text-center text-gray-500 py-8">You don't have any certificates yet.</p>
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

// Enrollment Modal Component
const EnrollmentModal = ({ course, formData, setFormData, profileImageFile, setProfileImageFile, profileImagePreview, setProfileImagePreview, onClose, onSubmit }) => {
  const toast = useToast();
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.warning('Please select an image file', { duration: 3000 });
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Image size should be less than 5MB', { duration: 3000 });
        return;
      }
      setProfileImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Enroll in {course.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="enrollment-profile-image" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image (Passport Size) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-4">
              {profileImagePreview && (
                <div className="w-24 h-24 border-2 border-gray-300 rounded overflow-hidden">
                  <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <input
                  id="enrollment-profile-image"
                  name="enrollment-profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload passport size photo (JPEG, PNG, max 5MB)</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="enrollment-class-type" className="block text-sm font-medium text-gray-700 mb-2">
              Class Type <span className="text-red-500">*</span>
            </label>
            <select
              id="enrollment-class-type"
              name="enrollment-class-type"
              value={formData.class_type}
              onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="online">Online</option>
              <option value="physical">Physical</option>
            </select>
          </div>

          <div>
            <Input
              type="tel"
              name="enrollment-phone-number"
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <Input
              type="text"
              name="enrollment-father-guardian"
              label="Father / Guardian Name"
              value={formData.father_guardian_name}
              onChange={(e) => setFormData({ ...formData, father_guardian_name: e.target.value })}
              placeholder="Enter father or guardian full name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enrollment-dob" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="enrollment-dob"
                name="enrollment-dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="enrollment-gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="enrollment-gender"
                name="enrollment-gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {formData.class_type === 'physical' && (
            <div>
              <label htmlFor="enrollment-address" className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="enrollment-address"
                name="enrollment-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full address"
                required
              />
            </div>
          )}

          <div>
            <Input
              type="text"
              name="enrollment-emergency-contact-name"
              label="Emergency Contact Name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              placeholder="Emergency contact name (optional)"
            />
          </div>

          <div>
            <Input
              type="tel"
              name="enrollment-emergency-contact-phone"
              label="Emergency Contact Phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              placeholder="Emergency contact phone (optional)"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Father/guardian name, date of birth, and gender are printed on your enrollment card.
              After enrollment, complete payment — once verified by admin you can download your card.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              Enroll Now
            </Button>
            <Button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentLMS;
