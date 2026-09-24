import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  const menuItems = [
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
        { id: 'users', label: 'Users', onClick: () => setActiveTab('users'), activeTab },
        { id: 'instructors', label: 'Instructors', onClick: () => setActiveTab('instructors'), activeTab },
        { id: 'students', label: 'Students', onClick: () => setActiveTab('students'), activeTab },
      ],
    },
    {
      group: 'Academic',
      items: [
        { id: 'attendance', label: 'Attendance', onClick: () => setActiveTab('attendance'), activeTab },
        { id: 'scholarships', label: 'Scholarships', onClick: () => setActiveTab('scholarships'), activeTab },
        { id: 'payments', label: 'Payments', onClick: () => setActiveTab('payments'), activeTab },
      ],
    },
    {
      group: 'Site',
      items: [
        { id: 'site-settings', label: 'Site Settings', onClick: () => setActiveTab('site-settings'), activeTab },
      ],
    },
  ];

  return (
    <DashboardLayout menuItems={menuItems} title="Admin">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">
              Welcome back, <span className="text-primary-500 font-semibold">{user?.full_name || user?.email}</span>!
            </p>
          </div>
          <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white text-sm font-semibold rounded-lg shadow-sm">
            Administrator
          </span>
        </div>

        <div>
          {activeTab === 'courses' && <AdminCourseManagement />}
          {activeTab === 'course-content' && <AdminCourseContent />}
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'instructors' && <AdminInstructorManagement />}
          {activeTab === 'students' && <AdminStudentManagement />}
          {activeTab === 'enrollments' && <AdminEnrollmentManagement />}
          {activeTab === 'attendance' && <AdminAttendanceManagement />}
          {activeTab === 'scholarships' && <AdminScholarshipManagement />}
          {activeTab === 'payments' && <AdminPaymentManagement />}
          {activeTab === 'site-settings' && <AdminSiteSettings />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
