import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isPaymentAdmin } from '../../navigation/adminAccess';
import AdminAuditLog from '../../components/admin/AdminAuditLog';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminCourseManagement from '../../components/admin/AdminCourseManagement';
import AdminCourseContent from '../../components/admin/AdminCourseContent';
import AdminUserManagement from '../../components/admin/AdminUserManagement';
import AdminInstructorManagement from '../../components/admin/AdminInstructorManagement';
import AdminStudentManagement from '../../components/admin/AdminStudentManagement';
import AdminEnrollmentManagement from '../../components/admin/AdminEnrollmentManagement';
import AdminAttendanceManagement from '../../components/admin/AdminAttendanceManagement';
import AdminScholarshipManagement from '../../components/admin/AdminScholarshipManagement';
import AdminPaymentManagement from '../../components/admin/AdminPaymentManagement';
import AdminSiteSettings from '../../components/admin/AdminSiteSettings';
import AdminOverview from '../../components/admin/AdminOverview.jsx';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [queueFocus, setQueueFocus] = useState(null);

  const openQueueItem = (focus) => {
    setQueueFocus(focus);
    setActiveTab(focus.tab);
  };

  const paymentAdmin = isPaymentAdmin(user?.role);
  const menuItems = [
    {
      group: 'Work',
      items: [
        { id: 'overview', label: 'Dashboard', onClick: () => setActiveTab('overview'), activeTab },
      ],
    },
    {
      group: 'Content Management',
      items: [
        { id: 'courses', label: 'Courses', onClick: () => setActiveTab('courses'), activeTab },
        { id: 'course-content', label: 'Course Content', onClick: () => setActiveTab('course-content'), activeTab },
        { id: 'enrollments-admin', label: 'Enrollments', onClick: () => setActiveTab('enrollments'), activeTab },
      ],
    },
    {
      group: 'User Management',
      items: [
        ...(paymentAdmin ? [{ id: 'users', label: 'Users', onClick: () => setActiveTab('users'), activeTab }] : []),
        { id: 'instructors', label: 'Instructors', onClick: () => setActiveTab('instructors'), activeTab },
        { id: 'students', label: 'Students', onClick: () => setActiveTab('students'), activeTab },
      ],
    },
    {
      group: 'Academic',
      items: [
        { id: 'attendance', label: 'Attendance', onClick: () => setActiveTab('attendance'), activeTab },
        ...(paymentAdmin ? [
          { id: 'scholarships', label: 'Scholarships', onClick: () => setActiveTab('scholarships'), activeTab },
          { id: 'payments', label: 'Payments', onClick: () => setActiveTab('payments'), activeTab },
        ] : []),
      ],
    },
    ...(paymentAdmin ? [{
      group: 'Records',
      items: [
        { id: 'audit-log', label: 'Audit log', onClick: () => setActiveTab('audit-log'), activeTab },
        { id: 'site-settings', label: 'Site Settings', onClick: () => setActiveTab('site-settings'), activeTab },
      ],
    }] : []),
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Admin">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Admin</h1>
          <p className="mt-1 text-gray-600">
            What needs attention, and what is happening in the academy.
            {user?.full_name || user?.email ? ` Signed in as ${user.full_name || user.email}.` : ''}
          </p>
        </div>

        <div>
          {activeTab === 'overview' && <AdminOverview onOpen={openQueueItem} />}
          {activeTab === 'courses' && <AdminCourseManagement />}
          {activeTab === 'course-content' && (
            <AdminCourseContent focus={queueFocus?.tab === 'course-content' ? queueFocus : null} />
          )}
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'instructors' && <AdminInstructorManagement />}
          {activeTab === 'students' && <AdminStudentManagement />}
          {activeTab === 'enrollments' && (
            <AdminEnrollmentManagement focusId={queueFocus?.tab === 'enrollments' ? queueFocus.id : null} />
          )}
          {activeTab === 'attendance' && <AdminAttendanceManagement />}
          {activeTab === 'scholarships' && (
            <AdminScholarshipManagement focusId={queueFocus?.tab === 'scholarships' ? queueFocus.id : null} />
          )}
          {activeTab === 'payments' && (
            <AdminPaymentManagement focusId={queueFocus?.tab === 'payments' ? queueFocus.id : null} />
          )}
          {activeTab === 'site-settings' && <AdminSiteSettings />}
          {activeTab === 'audit-log' && <AdminAuditLog />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
