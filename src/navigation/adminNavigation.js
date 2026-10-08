import { isPaymentAdmin } from './adminAccess';

/**
 * Admin navigation. Every entry is a group.
 * Payment, user, audit, and site-settings items stay limited to admin and super admin.
 */
export function adminNavigation({ role, activeTab, onSelect }) {
  const paymentAdmin = isPaymentAdmin(role);
  const item = (id, label) => ({
    id,
    label,
    onClick: () => onSelect(id),
    activeTab,
  });

  return [
    {
      group: 'Work',
      items: [item('overview', 'Dashboard')],
    },
    {
      group: 'Content Management',
      items: [
        item('courses', 'Courses'),
        item('course-content', 'Course Content'),
        item('enrollments', 'Enrollments'),
      ],
    },
    {
      group: 'User Management',
      items: [
        ...(paymentAdmin ? [item('users', 'Users')] : []),
        item('instructors', 'Instructors'),
        item('students', 'Students'),
      ],
    },
    {
      group: 'Academic',
      items: [
        item('attendance', 'Attendance'),
        ...(paymentAdmin ? [item('scholarships', 'Scholarships'), item('payments', 'Payments')] : []),
      ],
    },
    ...(paymentAdmin
      ? [{
        group: 'Records',
        items: [item('audit-log', 'Audit log'), item('site-settings', 'Site Settings')],
      }]
      : []),
  ];
}
