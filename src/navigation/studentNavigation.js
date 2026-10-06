/**
 * Student navigation for the academy.
 * Every item points at a route or LMS section that already exists.
 * Attendance and performance share one API response and render different sections of it.
 * Course videos and documents are lessons. Links and assignment instructions are resources.
 */

export function studentNavigation() {
  return [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    {
      group: 'My Learning',
      items: [
        { id: 'enrollments', label: 'My Courses', path: '/lms?section=enrollments' },
        { id: 'assignments', label: 'Assignments', path: '/lms?section=assignments' },
        { id: 'sessions', label: 'Live Classes', path: '/lms?section=sessions' },
        { id: 'materials', label: 'Resources', path: '/lms?section=materials' },
        { id: 'available', label: 'Available Courses', path: '/lms?section=available' },
        { id: 'calendar', label: 'Calendar', path: '/lms?section=calendar' },
      ],
    },
    {
      group: 'Academic',
      items: [
        { id: 'performance', label: 'Performance', path: '/lms?section=performance' },
        { id: 'attendance', label: 'Attendance', path: '/lms?section=attendance' },
        { id: 'certificates', label: 'Certificates', path: '/lms?section=certificates' },
      ],
    },
    {
      group: 'Finance',
      items: [
        { id: 'payments', label: 'Payments', path: '/lms?section=payments' },
        { id: 'scholarships', label: 'Scholarships', path: '/lms?section=scholarships' },
      ],
    },
    {
      group: 'Community',
      items: [
        { id: 'announcements', label: 'Announcements', path: '/lms?section=announcements' },
        { id: 'forum', label: 'Discussion', path: '/lms?section=forum' },
      ],
    },
    {
      group: 'Account',
      items: [
        { id: 'profile', label: 'Profile', path: '/settings?tab=profile' },
        { id: 'settings', label: 'Settings', path: '/settings' },
      ],
    },
  ];
}

const LMS_SECTION_TITLES = {
  dashboard: ['Learning overview', 'Continue from your courses, sessions, and announcements.'],
  enrollments: ['My Courses', 'Open a course to continue learning.'],
  available: ['Available Courses', 'Choose a course and enroll.'],
  scholarships: ['Scholarships', 'Review scholarships linked to your enrollments.'],
  assignments: ['Assignments', 'Open an assignment to submit your work.'],
  sessions: ['Live Classes', 'Join an upcoming class from your courses.'],
  materials: ['Resources', 'Open course materials from your enrollments.'],
  announcements: ['Announcements', 'Read updates from your courses.'],
  forum: ['Discussion', 'Join the discussion for your courses.'],
  performance: ['Performance', 'Review grades and attendance for your courses.'],
  attendance: ['Attendance', 'Review attendance recorded for your courses.'],
  calendar: ['Calendar', 'See upcoming classes and due dates.'],
  payments: ['Payments', 'Upload a receipt or review a payment.'],
  certificates: ['Certificates', 'Download a certificate when a course is complete.'],
};

export function lmsSectionTitle(section) {
  return LMS_SECTION_TITLES[section] || LMS_SECTION_TITLES.dashboard;
}

export function lmsTabForSection(section) {
  return section || 'dashboard';
}

/** Primary destinations shown in the mobile bottom bar. */
export function studentMobileNavigation() {
  return [
    { id: 'home', label: 'Home', path: '/dashboard' },
    { id: 'learn', label: 'Learn', path: '/lms?section=enrollments' },
    { id: 'assignments', label: 'Assignments', path: '/lms?section=assignments' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'profile', label: 'Profile', path: '/settings?tab=profile' },
  ];
}

/**
 * Remaining student destinations. These stay available from the mobile menu
 * and are omitted from the bottom bar.
 */
export function studentMobileMoreNavigation() {
  return studentNavigation()
    .filter((entry) => entry.group)
    .map((entry) => ({
      ...entry,
      items: entry.items.filter((item) => !['enrollments', 'assignments', 'profile', 'settings'].includes(item.id)),
    }))
    .filter((entry) => entry.items.length > 0);
}

export function isStudentMobileNavActive(id, location) {
  if (!location) return false;
  const section = new URLSearchParams(location.search).get('section');
  const tab = new URLSearchParams(location.search).get('tab');

  if (id === 'home') return location.pathname === '/dashboard';
  if (id === 'learn') {
    if (location.pathname.startsWith('/lms/course')) return true;
    return location.pathname === '/lms' && (!section || section === 'enrollments' || section === 'available');
  }
  if (id === 'assignments') return location.pathname === '/lms' && section === 'assignments';
  if (id === 'profile') {
    return location.pathname === '/settings' && tab !== 'notifications' && tab !== 'security';
  }
  return false;
}

export function isStudentNavActive(path, location) {
  if (!path || !location) return false;
  const [pathname, search = ''] = path.split('?');
  if (pathname === '/lms' && search.includes('section=enrollments') && location.pathname.startsWith('/lms/course')) {
    return true;
  }
  if (location.pathname !== pathname) return false;

  const expected = new URLSearchParams(search);
  const actual = new URLSearchParams(location.search);
  const expectedKeys = [...expected.keys()];

  if (expectedKeys.length === 0) {
    if (pathname === '/settings' && actual.get('tab') === 'profile') return false;
    if (pathname === '/lms') return false;
    return true;
  }

  return expectedKeys.every((key) => actual.get(key) === expected.get(key));
}
