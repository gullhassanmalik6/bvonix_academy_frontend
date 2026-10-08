import { useNavigate } from 'react-router-dom';
import { nextExpectedAction } from '../../enrollment/enrollmentWizard';

const DONE_SUBMISSIONS = new Set(['submitted', 'graded', 'late', 'resubmitted']);

function formatWhen(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function courseName(courseTitles, courseId) {
  return courseTitles.get(courseId) || 'Your course';
}

export function buildNextActions({
  learningEnrollments = [],
  accountEnrollments = [],
  materialsByCourse = {},
  assignments = [],
  sessions = [],
  courseTitles = new Map(),
}) {
  const continueCourse = [...learningEnrollments]
    .filter((item) => (item.progress_percentage || 0) < 100)
    .sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0))[0] || null;

  const continueItems = continueCourse
    ? [{
      id: continueCourse.id,
      headline: continueCourse.course_title,
      detail: `${Math.round(continueCourse.progress_percentage || 0)}% complete · ${continueCourse.watched_count ?? 0}/${continueCourse.total_materials ?? 0} lessons counted`,
      path: `/lms/course/${continueCourse.course_id}`,
      cta: (continueCourse.progress_percentage || 0) > 0 ? 'Continue' : 'Start course',
    }]
    : [];

  const lessonSource = continueCourse || learningEnrollments[0] || null;
  const lessonMaterials = lessonSource ? materialsByCourse[lessonSource.course_id] : null;
  let lessonItems = [];
  if (lessonSource && Array.isArray(lessonMaterials)) {
    const ordered = [...lessonMaterials].sort((a, b) => (a.order || 0) - (b.order || 0));
    const next = ordered[lessonSource.watched_count ?? 0] || null;
    if (next) {
      lessonItems = [{
        id: next.id,
        headline: next.title || 'Next lesson',
        detail: `${lessonSource.course_title} · ${next.material_type || 'lesson'}`,
        path: `/lms/course/${lessonSource.course_id}`,
        cta: 'Open lesson',
      }];
    }
  }

  const dueAssignments = assignments
    .filter((item) => item.due_date && !DONE_SUBMISSIONS.has(item.submissionStatus))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const assignmentItems = dueAssignments.slice(0, 3).map((item) => ({
    id: item.id,
    headline: item.title || 'Assignment',
    detail: [
      courseName(courseTitles, item.course_id),
      item.due_date ? `Due ${formatWhen(item.due_date)}` : null,
    ].filter(Boolean).join(' · '),
    path: `/lms/course/${item.course_id}`,
    cta: 'Open assignment',
  }));

  const nextSession = [...sessions]
    .filter((item) => item.start_time)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0] || null;
  const sessionItems = nextSession
    ? [{
      id: nextSession.id,
      headline: nextSession.title || 'Live class',
      detail: [
        courseName(courseTitles, nextSession.course_id),
        formatWhen(nextSession.start_time),
        nextSession.location || null,
      ].filter(Boolean).join(' · '),
      path: '/lms?section=sessions',
      cta: 'View class',
    }]
    : [];

  const waitingEnrollments = accountEnrollments.filter((item) => (
    !item.verified_by_admin || item.payment_status !== 'paid' || !['active', 'completed'].includes(item.status)
  ));
  const enrollmentSource = waitingEnrollments.length > 0 ? waitingEnrollments : accountEnrollments.slice(0, 1);
  const enrollmentItems = enrollmentSource.map((item) => ({
    id: item.id,
    headline: courseName(courseTitles, item.course_id),
    detail: `Payment: ${item.payment_status || 'unknown'} · ${nextExpectedAction(item)}`,
    path: '/lms?section=enrollments',
    cta: item.verified_by_admin ? 'View enrollment' : 'Review enrollment',
  }));

  const progressItems = learningEnrollments.length > 0
    ? [{
      id: 'progress',
      headline: `${Math.round(learningEnrollments.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / learningEnrollments.length)}% average progress`,
      detail: `${learningEnrollments.length} verified course${learningEnrollments.length === 1 ? '' : 's'}`,
      path: '/lms?section=performance',
      cta: 'View progress',
    }]
    : [];

  return [
    { key: 'continue', title: 'Continue Learning', empty: 'No course is in progress.', items: continueItems },
    { key: 'lesson', title: 'Next Lesson', empty: 'No next lesson is available yet.', items: lessonItems },
    { key: 'assignments', title: 'Assignments Due', empty: 'No assignments are due.', items: assignmentItems },
    { key: 'live', title: 'Next Live Class', empty: 'No live class is scheduled.', items: sessionItems },
    { key: 'enrollment', title: 'Enrollment and payment', empty: 'No enrollment or payment status is available.', items: enrollmentItems },
    { key: 'progress', title: 'Progress', empty: 'Progress appears after a verified enrollment.', items: progressItems },
  ];
}

function SectionNotice({ failure }) {
  if (!failure) return null;
  if (failure.kind === 'denied') {
    return (
      <div role="alert">
        <p className="text-sm font-semibold text-amber-900">Permission denied</p>
        <p className="text-sm text-amber-800">{failure.message}</p>
      </div>
    );
  }
  return <p className="text-sm text-red-700" role="alert">{failure.message}</p>;
}

export default function StudentNextActions({
  sections,
  sectionFailures = {},
  onBrowseCourses,
}) {
  const navigate = useNavigate();
  const primaryKey = sections.find((section) => section.items.length > 0)?.key || null;
  const primary = sections.find((section) => section.key === primaryKey);
  const primaryItem = primary?.items[0] || null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">What should I do next?</h2>
        <p className="mt-1 text-sm text-gray-600">The next useful step in your courses, assignments, and enrollment.</p>
      </div>

      {primaryItem ? (
        <article className="rounded-xl border-2 border-primary-500 bg-white p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{primary.title}</p>
          <h3 className="mt-2 text-lg sm:text-2xl font-semibold text-gray-900 break-words">{primaryItem.headline}</h3>
          <p className="mt-2 text-sm text-gray-600 break-words">{primaryItem.detail}</p>
          <button
            type="button"
            onClick={() => navigate(primaryItem.path)}
            className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600"
          >
            {primaryItem.cta}
          </button>
        </article>
      ) : (
        <article className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900">No courses enrolled yet</h3>
          <p className="mt-2 text-sm text-gray-600">Browse and enroll in a course to get a next lesson, assignment, or class.</p>
          <button
            type="button"
            onClick={onBrowseCourses}
            className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600"
          >
            Browse courses
          </button>
        </article>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sections.map((section) => {
          const failure = sectionFailures[section.key];
          const isPrimary = section.key === primaryKey;
          return (
            <section
              key={section.key}
              className={`rounded-lg border bg-white p-4 ${isPrimary ? 'border-primary-200 md:col-span-2' : 'border-gray-200'}`}
            >
              <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
              <div className="mt-2">
                {failure && <SectionNotice failure={failure} />}
                {!failure && section.items.length === 0 && (
                  <p className="text-sm text-gray-600">{section.empty}</p>
                )}
                {section.items.length > 0 && (
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => navigate(item.path)}
                          className="w-full min-h-11 rounded-lg px-2 py-2 text-left hover:bg-gray-50"
                        >
                          <span className="block text-sm font-medium text-gray-900 break-words">{item.headline}</span>
                          <span className="mt-1 block text-sm text-gray-600 break-words">{item.detail}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
