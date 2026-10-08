import React, { useState, useEffect } from 'react';
import { lmsService } from '../services/lmsService';
import { courseService } from '../services/courseService';
import { siteSettingsService } from '../services/siteSettingsService';
import StudentDashboardLayout from '../components/layout/StudentDashboardLayout';
import StudentDashboardRightSidebar from '../components/dashboard/StudentDashboardRightSidebar';
import StudentDashboardBanner from '../components/dashboard/StudentDashboardBanner';
import DashboardYouTubeSection from '../components/dashboard/DashboardYouTubeSection';
import StudentDashboardProgressCards from '../components/dashboard/StudentDashboardProgressCards';
import ContinueWatchingSection from '../components/dashboard/ContinueWatchingSection';
import YourMentorTable from '../components/dashboard/YourMentorTable';
import StudentNextActions, { buildNextActions } from '../components/dashboard/StudentNextActions';
import { ErrorState, PermissionDenied } from '../components/common/DataState';
import { interpretApiError } from '../services/api';

const DONE_SUBMISSIONS = new Set(['submitted', 'graded', 'late', 'resubmitted']);

async function settledList(promise, fallback) {
  try {
    const data = await promise;
    return { items: Array.isArray(data) ? data : (data?.items || []), failure: null };
  } catch (error) {
    return { items: [], failure: await interpretApiError(error, fallback) };
  }
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadFailure, setLoadFailure] = useState(null);
  const [dashboardData, setDashboardData] = useState({ enrollments: [], mentors: [] });
  const [accountEnrollments, setAccountEnrollments] = useState([]);
  const [materialsByCourse, setMaterialsByCourse] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sectionFailures, setSectionFailures] = useState({});
  const [courseTitles, setCourseTitles] = useState({});
  const [dashboardSettings, setDashboardSettings] = useState(siteSettingsService.DASHBOARD_DEFAULTS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadFailure(null);
      const [data, settings] = await Promise.all([
        lmsService.getDashboard(),
        siteSettingsService.getSiteSettings().catch(() => null),
      ]);
      const learning = data || { enrollments: [], mentors: [] };
      setDashboardData(learning);
      const verified = learning.enrollments || [];
      const enrollmentResult = await settledList(lmsService.getMyEnrollments(), 'Failed to load enrollment status');
      setAccountEnrollments(enrollmentResult.items);
      const titles = Object.fromEntries(verified.map((item) => [item.course_id, item.course_title]));
      const missingTitleIds = enrollmentResult.items
        .map((item) => item.course_id)
        .filter((courseId) => courseId && !titles[courseId]);
      if (missingTitleIds.length > 0) {
        try {
          const catalog = await courseService.getCourses({ skip: 0, limit: 100, published_only: true });
          (catalog?.items || []).forEach((course) => {
            if (missingTitleIds.includes(course.id)) titles[course.id] = course.title;
          });
        } catch {
          // Enrollment status still renders when a course title is unavailable.
        }
      }
      setCourseTitles(titles);
      const failures = {};
      if (enrollmentResult.failure) failures.enrollment = enrollmentResult.failure;

      const materials = {};
      const dueAssignments = [];
      if (verified.length > 0) {
        const materialGroups = await Promise.all(verified.map(async (enrollment) => {
          const result = await settledList(
            lmsService.getCourseMaterials(enrollment.course_id),
            'Failed to load the next lesson',
          );
          return { courseId: enrollment.course_id, ...result };
        }));
        materialGroups.forEach((group) => {
          if (group.failure && !failures.lesson) failures.lesson = group.failure;
          if (!group.failure) materials[group.courseId] = group.items;
        });

        const assignmentGroups = await Promise.all(verified.map(async (enrollment) => {
          const result = await settledList(
            lmsService.getCourseAssignments(enrollment.course_id),
            'Failed to load assignments',
          );
          return { courseId: enrollment.course_id, ...result };
        }));
        const assignmentRows = [];
        assignmentGroups.forEach((group) => {
          if (group.failure && !failures.assignments) failures.assignments = group.failure;
          group.items.forEach((assignment) => {
            assignmentRows.push({ ...assignment, course_id: assignment.course_id || group.courseId });
          });
        });
        const candidates = assignmentRows
          .filter((item) => item.due_date)
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 8);
        const withSubmissions = await Promise.all(candidates.map(async (assignment) => {
          try {
            const submission = await lmsService.getMySubmission(assignment.id);
            return { ...assignment, submissionStatus: submission?.status || null, submissionKnown: true };
          } catch (error) {
            if (!failures.assignments) {
              failures.assignments = await interpretApiError(error, 'Failed to load assignment status');
            }
            return { ...assignment, submissionStatus: null, submissionKnown: false };
          }
        }));
        dueAssignments.push(...withSubmissions.filter((item) => item.submissionKnown && !DONE_SUBMISSIONS.has(item.submissionStatus)));

        const sessionResult = await settledList(lmsService.getUpcomingSessions(), 'Failed to load live classes');
        setSessions(sessionResult.items);
        if (sessionResult.failure) failures.live = sessionResult.failure;
      } else {
        setSessions([]);
      }
      setMaterialsByCourse(materials);
      setAssignments(dueAssignments);
      setSectionFailures(failures);
      if (settings) {
        setDashboardSettings({
          dashboard_banner_title: settings.dashboard_banner_title,
          dashboard_banner_cta_text: settings.dashboard_banner_cta_text,
          dashboard_banner_cta_link: settings.dashboard_banner_cta_link,
          dashboard_youtube_url: settings.dashboard_youtube_url || '',
        });
      }
    } catch (error) {
      setDashboardData({ enrollments: [], mentors: [] });
      setAccountEnrollments([]);
      setMaterialsByCourse({});
      setAssignments([]);
      setSessions([]);
      setCourseTitles({});
      setSectionFailures({});
      setLoadFailure(await interpretApiError(error, 'Failed to load your dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const rightSidebar = (
    <StudentDashboardRightSidebar
      mentors={dashboardData.mentors}
      enrollments={dashboardData.enrollments}
    />
  );

  return (
    <StudentDashboardLayout rightSidebar={rightSidebar}>
      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <div className="h-8 w-56 max-w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-36 bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse md:col-span-2" />
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ) : loadFailure ? (
        loadFailure.kind === 'denied'
          ? <PermissionDenied message={loadFailure.message} />
          : <ErrorState message={loadFailure.message} onRetry={loadData} />
      ) : (
        <div className="space-y-6 w-full max-w-full">
          <StudentNextActions
            sections={buildNextActions({
              learningEnrollments: dashboardData.enrollments,
              accountEnrollments,
              materialsByCourse,
              assignments,
              sessions,
              courseTitles: new Map(Object.entries(courseTitles)),
            })}
            sectionFailures={sectionFailures}
            onBrowseCourses={() => { window.location.href = '/courses'; }}
          />

          <details className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900">
              More from your academy
            </summary>
            <div className="mt-4 space-y-6">
              <StudentDashboardBanner
                title={dashboardSettings.dashboard_banner_title}
                ctaText={dashboardSettings.dashboard_banner_cta_text}
                ctaLink={dashboardSettings.dashboard_banner_cta_link}
              />
              <DashboardYouTubeSection youtubeUrl={dashboardSettings.dashboard_youtube_url} />
              <StudentDashboardProgressCards enrollments={dashboardData.enrollments} />
              <ContinueWatchingSection enrollments={dashboardData.enrollments} />
              <YourMentorTable mentors={dashboardData.mentors} />
            </div>
          </details>
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default Dashboard;
