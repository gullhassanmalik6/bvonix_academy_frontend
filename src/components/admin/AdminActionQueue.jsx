import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import AttendanceCorrectionList from './AttendanceCorrectionList';

const LIST_LIMIT = 100;
const GRADE_STATUSES = new Set(['pending', 'submitted', 'late', 'resubmitted']);

async function failedSection(error, fallback) {
  const failure = await interpretApiError(error, fallback);
  return {
    status: failure.kind === 'denied' ? 'denied' : 'error',
    items: [],
    note: null,
    error: failure.message,
  };
}

function permissionsFor(role) {
  const paymentAdmin = role === 'admin' || role === 'super_admin';
  const management = paymentAdmin || role === 'academic_manager';
  return {
    payments: paymentAdmin,
    enrollments: paymentAdmin,
    scholarships: paymentAdmin,
    assignments: management,
    attendance: management,
  };
}

function formatWhen(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function courseTitle(coursesById, courseId) {
  return coursesById.get(courseId)?.title || (courseId ? `Course ${String(courseId).slice(-6)}` : 'Course');
}

function studentLabel(studentsById, usersById, studentId) {
  const student = studentsById.get(studentId);
  const user = student ? usersById.get(student.user_id) : null;
  if (user?.full_name) return user.full_name;
  if (user?.email) return user.email;
  if (studentId) return `Student ${String(studentId).slice(-6)}`;
  return 'Student';
}

function limitedNote(total) {
  if (typeof total === 'number' && total > LIST_LIMIT) {
    return `Showing the first ${LIST_LIMIT} of ${total} records returned by the API.`;
  }
  return null;
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
    }
  }
  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, run));
  return results;
}

function indexById(items) {
  return new Map((items || []).map((item) => [item.id, item]));
}

const emptySection = () => ({ status: 'loading', items: [], error: null, note: null });

function Section({ title, section, onOpen }) {
  return (
    <section className="border border-gray-200 bg-white">
      <div className="flex items-baseline justify-between gap-3 border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {section.status === 'ready' && (
          <span className="text-sm text-gray-600">{section.items.length}</span>
        )}
      </div>
      <div className="px-4 py-3">
        {section.status === 'loading' && (
          <p className="text-sm text-gray-600">Loading…</p>
        )}
        {section.error && section.status !== 'denied' && (
          <p className="mb-3 text-sm text-red-700" role="alert">{section.error}</p>
        )}
        {section.status === 'error' && !section.error && (
          <p className="text-sm text-red-700" role="alert">This request failed.</p>
        )}
        {section.status === 'denied' && (
          <div role="alert">
            <p className="text-sm font-semibold text-amber-900">Permission denied</p>
            <p className="text-sm text-amber-800">{section.error}</p>
          </div>
        )}
        {section.status === 'unavailable' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">{section.note}</p>
            <button
              type="button"
              onClick={() => onOpen({ tab: 'attendance' })}
              className="text-sm font-medium text-blue-700 underline"
            >
              Open attendance
            </button>
          </div>
        )}
        {section.status === 'ready' && section.items.length === 0 && (
          <p className="text-sm text-gray-600">{section.note || 'Nothing is waiting.'}</p>
        )}
        {section.status === 'ready' && section.items.length > 0 && (
          <ul className="divide-y divide-gray-200 border border-gray-200">
            {section.items.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onOpen(item.focus)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50"
                >
                  <span className="block text-sm font-medium text-gray-900">{item.title}</span>
                  <span className="mt-1 block text-sm text-gray-600">{item.detail}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {section.status === 'ready' && section.note && section.items.length > 0 && (
          <p className="mt-3 text-xs text-gray-500">{section.note}</p>
        )}
      </div>
    </section>
  );
}

export default function AdminActionQueue({ onOpen }) {
  const { user } = useAuth();
  const access = permissionsFor(user?.role);
  const [reloadKey, setReloadKey] = useState(0);
  const [sections, setSections] = useState(() => ({
    payments: access.payments ? emptySection() : null,
    enrollments: access.enrollments ? emptySection() : null,
    scholarships: access.scholarships ? emptySection() : null,
    assignments: access.assignments ? emptySection() : null,
  }));

  useEffect(() => {
    let cancelled = false;
    const nextAccess = permissionsFor(user?.role);

    function publish(key, value) {
      if (cancelled) return;
      setSections((current) => ({ ...current, [key]: value }));
    }

    async function lookupContext() {
      const [studentsResult, usersResult, coursesResult] = await Promise.allSettled([
        nextAccess.payments || nextAccess.enrollments || nextAccess.scholarships || nextAccess.assignments
          ? adminService.getStudents(0, LIST_LIMIT)
          : Promise.resolve({ items: [] }),
        nextAccess.payments || nextAccess.enrollments || nextAccess.scholarships || nextAccess.assignments
          ? adminService.getUsers(0, LIST_LIMIT)
          : Promise.resolve({ items: [] }),
        adminService.getCourses(0, LIST_LIMIT, false),
      ]);
      return {
        studentsById: indexById(studentsResult.status === 'fulfilled' ? studentsResult.value?.items : []),
        usersById: indexById(usersResult.status === 'fulfilled' ? usersResult.value?.items : []),
        coursesById: indexById(coursesResult.status === 'fulfilled' ? coursesResult.value?.items : []),
        courses: coursesResult.status === 'fulfilled' ? (coursesResult.value?.items || []) : [],
        coursesError: coursesResult.status === 'rejected' ? coursesResult.reason : null,
      };
    }

    async function loadPayments(context) {
      try {
        const data = await adminService.getPayments(0, LIST_LIMIT);
        const pending = (data.items || []).filter((payment) => payment.payment_status === 'pending');
        publish('payments', {
          status: 'ready',
          error: null,
          note: pending.length === 0
            ? 'No payment records are pending. Enrollment receipts waiting for verification are listed under enrollment applications.'
            : limitedNote(data.total),
          items: pending.map((payment) => ({
            key: payment.id,
            title: `${payment.amount} ${payment.currency || ''}`.trim(),
            detail: [
              studentLabel(context.studentsById, context.usersById, payment.student_id),
              courseTitle(context.coursesById, payment.course_id),
              payment.payment_method ? `Method: ${payment.payment_method}` : null,
              'Status: pending',
              formatWhen(payment.created_at),
            ].filter(Boolean).join(' · '),
            focus: { tab: 'payments', id: payment.id },
          })),
        });
      } catch (error) {
        publish('payments', await failedSection(error, 'Failed to load payments'));
      }
    }

    async function loadEnrollments(context) {
      try {
        const data = await adminService.getEnrollments(0, LIST_LIMIT);
        const waiting = (data.items || []).filter((enrollment) => (
          enrollment.workflow_state === 'receipt_uploaded' || enrollment.workflow_state === 'under_review'
        ));
        publish('enrollments', {
          status: 'ready',
          error: null,
          note: waiting.length === 0
            ? 'No applications are in receipt review or under review.'
            : limitedNote(data.total),
          items: waiting.map((enrollment) => {
            const waitingOnReceipt = enrollment.workflow_state === 'receipt_uploaded';
            return {
              key: enrollment.id,
              title: courseTitle(context.coursesById, enrollment.course_id),
              detail: [
                studentLabel(context.studentsById, context.usersById, enrollment.student_id),
                waitingOnReceipt
                  ? 'Receipt uploaded. Start review or verify the payment.'
                  : 'Application is under review.',
                `Payment: ${enrollment.payment_status || 'pending'}`,
                enrollment.class_type ? `Class: ${enrollment.class_type}` : null,
                formatWhen(enrollment.updated_at || enrollment.created_at),
              ].filter(Boolean).join(' · '),
              focus: { tab: 'enrollments', id: enrollment.id },
            };
          }),
        });
      } catch (error) {
        publish('enrollments', await failedSection(error, 'Failed to load enrollments'));
      }
    }

    async function loadScholarships(context) {
      try {
        const data = await adminService.getScholarships(0, LIST_LIMIT);
        const reviews = (data.items || []).flatMap((scholarship) => {
          const max = Number(scholarship.max_absences_per_month);
          const absences = Number(scholarship.current_month_absences);
          const atRisk = scholarship.status === 'active' && max > 0 && absences >= max - 1;
          if (scholarship.status !== 'pending' && !atRisk) return [];
          const reason = scholarship.status === 'pending'
            ? 'Scholarship is pending'
            : `Absences ${absences}/${max} are at the review threshold`;
          return [{
            key: scholarship.id,
            title: `${scholarship.scholarship_type || 'Scholarship'} · ${scholarship.amount}%`,
            detail: [
              studentLabel(context.studentsById, context.usersById, scholarship.student_id),
              courseTitle(context.coursesById, scholarship.course_id),
              reason,
              `Status: ${scholarship.status}`,
            ].filter(Boolean).join(' · '),
            focus: { tab: 'scholarships', id: scholarship.id },
          }];
        });
        publish('scholarships', {
          status: 'ready',
          error: null,
          note: reviews.length === 0
            ? 'No scholarships are pending or at the absence review threshold.'
            : limitedNote(data.total),
          items: reviews,
        });
      } catch (error) {
        publish('scholarships', await failedSection(error, 'Failed to load scholarships'));
      }
    }

    async function loadAssignments(context) {
      if (context.coursesError) {
        publish('assignments', await failedSection(context.coursesError, 'Failed to load courses'));
        return;
      }
      try {
        let failed = 0;
        const assignmentGroups = await mapPool(context.courses, 4, async (course) => {
          try {
            const data = await adminService.getAssignments(course.id, 0, LIST_LIMIT);
            return { course, assignments: data.items || [] };
          } catch {
            failed += 1;
            return { course, assignments: [] };
          }
        });
        const assignments = assignmentGroups.flatMap((group) => group.assignments.map((assignment) => ({
          assignment,
          course: group.course,
        })));
        const submissionGroups = await mapPool(assignments, 4, async ({ assignment, course }) => {
          try {
            const data = await adminService.getSubmissions(assignment.id);
            const submissions = Array.isArray(data) ? data : (data?.items || []);
            return { assignment, course, submissions };
          } catch {
            failed += 1;
            return { assignment, course, submissions: [] };
          }
        });
        const items = submissionGroups.flatMap(({ assignment, course, submissions }) => (
          submissions
            .filter((submission) => GRADE_STATUSES.has(submission.status) && submission.status !== 'graded')
            .map((submission) => ({
              key: submission.id,
              title: assignment.title || 'Assignment',
              detail: [
                course.title || courseTitle(context.coursesById, course.id),
                studentLabel(context.studentsById, context.usersById, submission.student_id),
                `Status: ${submission.status}`,
                formatWhen(submission.submitted_at),
              ].filter(Boolean).join(' · '),
              focus: {
                tab: 'course-content',
                courseId: course.id,
                assignmentId: assignment.id,
                submissionId: submission.id,
              },
            }))
        ));
        if (failed > 0 && items.length === 0) {
          publish('assignments', {
            status: 'error',
            error: `${failed} course or assignment requests failed.`,
            note: null,
            items: [],
          });
          return;
        }
        publish('assignments', {
          status: 'ready',
          error: failed > 0
            ? `${failed} course or assignment requests failed. The records below are only the ones that loaded.`
            : null,
          note: items.length === 0 ? 'No submissions are waiting for a grade.' : null,
          items,
        });
      } catch (error) {
        publish('assignments', await failedSection(error, 'Failed to load assignment submissions'));
      }
    }

    setSections({
      payments: nextAccess.payments ? emptySection() : null,
      enrollments: nextAccess.enrollments ? emptySection() : null,
      scholarships: nextAccess.scholarships ? emptySection() : null,
      assignments: nextAccess.assignments ? emptySection() : null,
    });

    lookupContext().then((context) => {
      if (cancelled) return;
      if (nextAccess.payments) loadPayments(context);
      if (nextAccess.enrollments) loadEnrollments(context);
      if (nextAccess.scholarships) loadScholarships(context);
      if (nextAccess.assignments) loadAssignments(context);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.role, reloadKey]);

  const visible = [
    access.payments ? ['payments', 'Payments awaiting verification'] : null,
    access.enrollments ? ['enrollments', 'Enrollment applications awaiting review'] : null,
    access.attendance ? ['attendance', 'Attendance corrections'] : null,
    access.scholarships ? ['scholarships', 'Scholarship reviews'] : null,
    access.assignments ? ['assignments', 'Assignment grading'] : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Action queue</h2>
          <p className="text-sm text-gray-600">Work that is waiting on an administrator.</p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      {visible.length === 0 ? (
        <p className="border border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
          This account is not authorized for the queued administrator actions.
        </p>
      ) : (
        visible.map(([key, title]) => (
          key === 'attendance' ? (
            <section key={key} className="border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              </div>
              <div className="px-4 py-3">
                <AttendanceCorrectionList onOpen={onOpen} />
              </div>
            </section>
          ) : (
            <Section key={key} title={title} section={sections[key]} onOpen={onOpen} />
          )
        ))
      )}
    </div>
  );
}
