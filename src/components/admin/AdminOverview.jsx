import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import AdminActionQueue from './AdminActionQueue';
import {
  PAGE_LIMIT,
  NEW_ENROLLMENT_DAYS,
  accessFor,
  fetchAllPages,
  activeStudentCount,
  newEnrollmentCount,
  pendingPaymentCount,
  completedRevenue,
  completionSummary,
  reviewCount,
  atRiskCount,
  formatMoney,
  metricFromComplete,
  timestamp,
} from './overviewMetrics';

const loadingMetric = () => ({ status: 'loading', value: null, detail: null });

async function failedMetric(error, fallback) {
  const failure = await interpretApiError(error, fallback);
  return {
    status: failure.kind === 'denied' ? 'denied' : 'error',
    value: null,
    detail: failure.message,
  };
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

function MetricCard({ label, metric, onOpen, tab }) {
  const body = (
    <>
      <p className="text-sm text-gray-600">{label}</p>
      {metric.status === 'loading' && <p className="mt-2 text-sm text-gray-500">Loading…</p>}
      {metric.status === 'error' && (
        <p className="mt-2 text-sm text-red-700" role="alert">{metric.detail}</p>
      )}
      {metric.status === 'denied' && (
        <div className="mt-2" role="alert">
          <p className="text-sm font-semibold text-amber-900">Permission denied</p>
          <p className="text-sm text-amber-800">{metric.detail}</p>
        </div>
      )}
      {metric.status === 'unavailable' && (
        <p className="mt-2 text-sm text-gray-700">{metric.detail}</p>
      )}
      {metric.status === 'empty' && (
        <>
          <p className="mt-1 break-words text-2xl font-semibold text-gray-900">{metric.value}</p>
          <p className="mt-1 text-sm text-gray-600">{metric.detail}</p>
        </>
      )}
      {metric.status === 'ready' && (
        <>
          <p className="mt-1 break-words text-2xl font-semibold text-gray-900">{metric.value}</p>
          {metric.detail && <p className="mt-1 text-sm text-gray-600">{metric.detail}</p>}
        </>
      )}
    </>
  );
  const className = 'border border-gray-200 bg-white px-4 py-3 text-left';
  if ((metric.status === 'ready' || metric.status === 'empty') && tab && onOpen) {
    return (
      <button type="button" onClick={() => onOpen({ tab })} className={`${className} hover:bg-gray-50`}>
        {body}
      </button>
    );
  }
  return <div className={className}>{body}</div>;
}

function Panel({ title, children }) {
  return (
    <section className="border border-gray-200 bg-white">
      <h3 className="border-b border-gray-200 px-4 py-3 text-base font-semibold text-gray-900">{title}</h3>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

export default function AdminOverview({ onOpen }) {
  const { user } = useAuth();
  const access = accessFor(user?.role);
  const [reloadKey, setReloadKey] = useState(0);
  const [metrics, setMetrics] = useState(() => ({
    students: loadingMetric(),
    enrollments: loadingMetric(),
    payments: access.paymentAdmin ? loadingMetric() : {
      status: 'unavailable',
      value: null,
      detail: 'This account cannot view payments.',
    },
    revenue: access.paymentAdmin ? loadingMetric() : {
      status: 'unavailable',
      value: null,
      detail: 'This account cannot view payments.',
    },
    attendance: loadingMetric(),
    completion: loadingMetric(),
    scholarships: access.paymentAdmin ? loadingMetric() : {
      status: 'unavailable',
      value: null,
      detail: 'This account cannot view scholarships.',
    },
    certificates: loadingMetric(),
  }));
  const [activity, setActivity] = useState({ status: 'loading', items: [], note: null });
  const [alerts, setAlerts] = useState({ status: 'loading', items: [], note: null, gap: null });

  useEffect(() => {
    let cancelled = false;
    const roleAccess = accessFor(user?.role);

    function setMetric(key, metric) {
      if (!cancelled) setMetrics((current) => ({ ...current, [key]: metric }));
    }

    async function load() {
      setMetrics((current) => ({
        ...current,
        students: loadingMetric(),
        enrollments: loadingMetric(),
        completion: loadingMetric(),
        payments: roleAccess.paymentAdmin ? loadingMetric() : current.payments,
        revenue: roleAccess.paymentAdmin ? loadingMetric() : current.revenue,
        scholarships: roleAccess.paymentAdmin ? loadingMetric() : current.scholarships,
        attendance: loadingMetric(),
        certificates: loadingMetric(),
      }));
      setActivity({ status: 'loading', items: [], note: null });
      setAlerts({ status: 'loading', items: [], note: null, gap: null });

      const studentsPromise = fetchAllPages((skip) => adminService.getStudents(skip, PAGE_LIMIT));
      const enrollmentsPromise = fetchAllPages((skip) => adminService.getEnrollments(skip, PAGE_LIMIT));
      const completedPromise = adminService.getEnrollments(0, 1, 'completed');
      const paymentsPromise = roleAccess.paymentAdmin
        ? fetchAllPages((skip) => adminService.getPayments(skip, PAGE_LIMIT))
        : Promise.resolve(null);
      const activeScholarshipsPromise = roleAccess.paymentAdmin
        ? fetchAllPages((skip) => adminService.getScholarships(skip, PAGE_LIMIT, null, 'active'))
        : Promise.resolve(null);
      const pendingScholarshipsPromise = roleAccess.paymentAdmin
        ? fetchAllPages((skip) => adminService.getScholarships(skip, PAGE_LIMIT, null, 'pending'))
        : Promise.resolve(null);
      const attendancePromise = adminService.getAttendanceSummary();
      const certificatesPromise = adminService.getCertificateSummary();
      const coursesPromise = adminService.getCourses(0, PAGE_LIMIT, false);
      const usersPromise = roleAccess.paymentAdmin
        ? adminService.getUsers(0, PAGE_LIMIT)
        : Promise.resolve({ items: [] });

      const [
        studentsResult,
        enrollmentsResult,
        completedResult,
        paymentsResult,
        activeScholarshipsResult,
        pendingScholarshipsResult,
        coursesResult,
        usersResult,
        attendanceResult,
        certificatesResult,
      ] = await Promise.allSettled([
        studentsPromise,
        enrollmentsPromise,
        completedPromise,
        paymentsPromise,
        activeScholarshipsPromise,
        pendingScholarshipsPromise,
        coursesPromise,
        usersPromise,
        attendancePromise,
        certificatesPromise,
      ]);

      if (cancelled) return;

      const students = studentsResult.status === 'fulfilled' ? studentsResult.value : null;
      const enrollments = enrollmentsResult.status === 'fulfilled' ? enrollmentsResult.value : null;
      const payments = paymentsResult.status === 'fulfilled' ? paymentsResult.value : null;
      const activeScholarships = activeScholarshipsResult.status === 'fulfilled' ? activeScholarshipsResult.value : null;
      const pendingScholarships = pendingScholarshipsResult.status === 'fulfilled' ? pendingScholarshipsResult.value : null;

      if (studentsResult.status === 'rejected') {
        setMetric('students', await failedMetric(studentsResult.reason, 'Failed to load students'));
      } else {
        setMetric('students', metricFromComplete(
          students.complete,
          activeStudentCount(students.items),
          'Student profiles marked active',
          'No active student profiles',
        ));
      }

      if (enrollmentsResult.status === 'rejected') {
        setMetric('enrollments', await failedMetric(enrollmentsResult.reason, 'Failed to load enrollments'));
      } else {
        setMetric('enrollments', metricFromComplete(
          enrollments.complete,
          newEnrollmentCount(enrollments.items, Date.now()),
          `Created in the last ${NEW_ENROLLMENT_DAYS} days`,
          `None created in the last ${NEW_ENROLLMENT_DAYS} days`,
        ));
      }

      if (completedResult.status === 'rejected' || enrollmentsResult.status === 'rejected') {
        const reason = completedResult.status === 'rejected' ? completedResult.reason : enrollmentsResult.reason;
        setMetric('completion', await failedMetric(reason, 'Failed to load enrollment totals'));
      } else {
        const summary = completionSummary(enrollments.total, completedResult.value?.total || 0);
        setMetric('completion', summary.empty
          ? { status: 'empty', value: '—', detail: 'No enrollments' }
          : {
              status: 'ready',
              value: `${summary.percent}%`,
              detail: `${summary.completed} of ${summary.total} enrollments are completed`,
            });
      }

      if (attendanceResult.status === 'rejected') {
        setMetric('attendance', await failedMetric(attendanceResult.reason, 'Failed to load attendance'));
      } else if (!attendanceResult.value?.total) {
        setMetric('attendance', {
          status: 'empty',
          value: '—',
          detail: 'No attendance has been recorded',
        });
      } else {
        setMetric('attendance', {
          status: 'ready',
          value: `${attendanceResult.value.rate}%`,
          detail: `${attendanceResult.value.attended} of ${attendanceResult.value.total} marks were present, late, or excused`,
        });
      }

      if (certificatesResult.status === 'rejected') {
        setMetric('certificates', await failedMetric(certificatesResult.reason, 'Failed to load certificates'));
      } else if (!certificatesResult.value?.issued) {
        setMetric('certificates', {
          status: 'empty',
          value: '0',
          detail: 'No certificates have been issued',
        });
      } else {
        setMetric('certificates', {
          status: 'ready',
          value: String(certificatesResult.value.issued),
          detail: 'Certificates stored for completed enrollments',
        });
      }

      if (roleAccess.paymentAdmin) {
        if (paymentsResult.status === 'rejected') {
          const failed = await failedMetric(paymentsResult.reason, 'Failed to load payments');
          setMetric('payments', failed);
          setMetric('revenue', failed);
        } else {
          setMetric('payments', metricFromComplete(
            payments.complete,
            pendingPaymentCount(payments.items),
            'Payment records with status pending',
            'No payment records are pending',
          ));
          if (!payments.complete) {
            setMetric('revenue', {
              status: 'unavailable',
              value: null,
              detail: 'The payment list is longer than the pages loaded, and it cannot be filtered by status. A partial total is not shown.',
            });
          } else {
            const totals = completedRevenue(payments.items);
            if (totals.length === 0) {
              setMetric('revenue', {
                status: 'empty',
                value: '0',
                detail: 'No completed payment records',
              });
            } else if (totals.length === 1) {
              setMetric('revenue', {
                status: 'ready',
                value: formatMoney(totals[0].amount, totals[0].currency),
                detail: 'Sum of completed payment records',
              });
            } else {
              setMetric('revenue', {
                status: 'ready',
                value: totals.map((entry) => formatMoney(entry.amount, entry.currency)).join(' · '),
                detail: 'Completed payment records, listed by currency',
              });
            }
          }
        }

        if (activeScholarshipsResult.status === 'rejected' || pendingScholarshipsResult.status === 'rejected') {
          const reason = activeScholarshipsResult.status === 'rejected'
            ? activeScholarshipsResult.reason
            : pendingScholarshipsResult.reason;
          setMetric('scholarships', await failedMetric(reason, 'Failed to load scholarships'));
        } else {
          const activeTotal = activeScholarships.total;
          const pendingTotal = pendingScholarships?.total || 0;
          setMetric('scholarships', {
            status: activeTotal === 0 && pendingTotal === 0 ? 'empty' : 'ready',
            value: String(activeTotal),
            detail: activeTotal === 0 && pendingTotal === 0
              ? 'No scholarships'
              : (pendingTotal === 0 ? 'Active scholarships' : `${pendingTotal} pending`),
          });
        }
      }

      const courses = coursesResult.status === 'fulfilled' ? (coursesResult.value?.items || []) : [];
      const users = usersResult.status === 'fulfilled' ? (usersResult.value?.items || []) : [];
      const coursesById = new Map(courses.map((course) => [course.id, course]));
      const usersById = new Map(users.map((account) => [account.id, account]));
      const studentsById = new Map((students?.items || []).map((student) => [student.id, student]));

      const events = [];
      const skipped = [];
      function addEvents(source, records, toEvent) {
        if (!source) return;
        if (!source.complete) {
          skipped.push(source.label);
          return;
        }
        records.forEach((record) => {
          const time = timestamp(record);
          if (time == null) return;
          events.push({ ...toEvent(record), time });
        });
      }
      if (enrollmentsResult.status === 'fulfilled') {
        addEvents(
          { ...enrollments, label: 'enrollments' },
          enrollments.items,
          (enrollment) => ({
            key: `enrollment-${enrollment.id}`,
            title: `Enrollment ${enrollment.workflow_state || enrollment.status || ''}`.trim(),
            detail: [
              courseTitle(coursesById, enrollment.course_id),
              studentLabel(studentsById, usersById, enrollment.student_id),
            ].join(' · '),
            focus: { tab: 'enrollments', id: enrollment.id },
          }),
        );
      }
      if (roleAccess.paymentAdmin && paymentsResult.status === 'fulfilled') {
        addEvents(
          { ...payments, label: 'payments' },
          payments.items,
          (payment) => ({
            key: `payment-${payment.id}`,
            title: `Payment ${payment.payment_status || ''}`.trim(),
            detail: [
              formatMoney(payment.amount, payment.currency),
              studentLabel(studentsById, usersById, payment.student_id),
            ].join(' · '),
            focus: { tab: 'payments', id: payment.id },
          }),
        );
      }
      if (roleAccess.paymentAdmin && activeScholarshipsResult.status === 'fulfilled') {
        addEvents(
          { ...activeScholarships, label: 'active scholarships' },
          activeScholarships.items,
          (scholarship) => ({
            key: `scholarship-${scholarship.id}`,
            title: `Scholarship ${scholarship.status || ''}`.trim(),
            detail: [
              studentLabel(studentsById, usersById, scholarship.student_id),
              courseTitle(coursesById, scholarship.course_id),
            ].join(' · '),
            focus: { tab: 'scholarships', id: scholarship.id },
          }),
        );
      }
      if (roleAccess.paymentAdmin && pendingScholarshipsResult.status === 'fulfilled') {
        addEvents(
          { ...pendingScholarships, label: 'pending scholarships' },
          pendingScholarships.items,
          (scholarship) => ({
            key: `scholarship-${scholarship.id}`,
            title: `Scholarship ${scholarship.status || ''}`.trim(),
            detail: [
              studentLabel(studentsById, usersById, scholarship.student_id),
              courseTitle(coursesById, scholarship.course_id),
            ].join(' · '),
            focus: { tab: 'scholarships', id: scholarship.id },
          }),
        );
      }

      events.sort((a, b) => b.time - a.time);
      const activityNote = skipped.length
        ? `${skipped.join(', ')} did not load completely, so those records are left out.`
        : null;
      setActivity({
        status: 'ready',
        items: events.slice(0, 8).map((event) => ({
          ...event,
          when: new Date(event.time).toLocaleString(),
        })),
        note: activityNote,
        incomplete: skipped.length > 0,
      });

      const alertItems = [];
      const alertGaps = [];
      if (roleAccess.paymentAdmin && paymentsResult.status === 'fulfilled') {
        if (!payments.complete) {
          alertGaps.push('Pending payments need the full payment list.');
        } else {
          const pending = pendingPaymentCount(payments.items);
          if (pending > 0) {
            alertItems.push({
              key: 'pending-payments',
              text: `${pending} payment record${pending === 1 ? '' : 's'} awaiting verification`,
              focus: { tab: 'payments' },
            });
          }
        }
      }
      if (enrollmentsResult.status === 'fulfilled') {
        if (!enrollments.complete) {
          alertGaps.push('Enrollment review needs the full enrollment list.');
        } else {
          const waiting = reviewCount(enrollments.items);
          if (waiting > 0) {
            alertItems.push({
              key: 'enrollment-review',
              text: `${waiting} enrollment application${waiting === 1 ? '' : 's'} awaiting review`,
              focus: { tab: 'enrollments' },
            });
          }
        }
      }
      if (roleAccess.paymentAdmin && pendingScholarshipsResult.status === 'fulfilled') {
        const pending = pendingScholarships?.total || 0;
        if (pending > 0) {
          alertItems.push({
            key: 'pending-scholarships',
            text: `${pending} scholarship${pending === 1 ? '' : 's'} pending review`,
            focus: { tab: 'scholarships' },
          });
        }
      }
      if (roleAccess.paymentAdmin && activeScholarshipsResult.status === 'fulfilled') {
        if (!activeScholarships.complete) {
          alertGaps.push('Absence-threshold scholarships need the full active list.');
        } else {
          const atRisk = atRiskCount(activeScholarships.items);
          if (atRisk > 0) {
            alertItems.push({
              key: 'at-risk-scholarships',
              text: `${atRisk} active scholarship${atRisk === 1 ? '' : 's'} at the absence review threshold`,
              focus: { tab: 'scholarships' },
            });
          }
        }
      }
      const alertErrors = [];
      if (enrollmentsResult.status === 'rejected') alertErrors.push('Enrollments could not be checked.');
      if (roleAccess.paymentAdmin && paymentsResult.status === 'rejected') alertErrors.push('Payments could not be checked.');
      if (roleAccess.paymentAdmin && (activeScholarshipsResult.status === 'rejected' || pendingScholarshipsResult.status === 'rejected')) {
        alertErrors.push('Scholarships could not be checked.');
      }
      setAlerts({
        status: alertItems.length === 0 && alertErrors.length > 0 ? 'error' : 'ready',
        items: alertItems,
        note: alertErrors.join(' '),
        gap: alertGaps.join(' '),
      });
    }

    if (!roleAccess.management) return undefined;
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.role, reloadKey]);

  if (!access.management) {
    return (
      <p className="border border-gray-200 bg-white px-4 py-6 text-sm text-gray-700">
        This account is not authorized for academy operations.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          Counts use the admin lists. A figure is omitted when the API cannot support it.
        </p>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active students" metric={metrics.students} onOpen={onOpen} tab="students" />
        <MetricCard label="New enrollments" metric={metrics.enrollments} onOpen={onOpen} tab="enrollments" />
        <MetricCard label="Pending payments" metric={metrics.payments} onOpen={onOpen} tab="payments" />
        <MetricCard label="Revenue" metric={metrics.revenue} onOpen={onOpen} tab="payments" />
        <MetricCard label="Attendance rate" metric={metrics.attendance} />
        <MetricCard label="Course completion" metric={metrics.completion} onOpen={onOpen} tab="enrollments" />
        <MetricCard label="Scholarships" metric={metrics.scholarships} onOpen={onOpen} tab="scholarships" />
        <MetricCard label="Certificates issued" metric={metrics.certificates} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Recent activity">
          {activity.status === 'loading' && <p className="text-sm text-gray-600">Loading…</p>}
          {activity.status === 'ready' && activity.items.length === 0 && !activity.incomplete && (
            <p className="text-sm text-gray-600">No enrollment, payment, or scholarship updates to show.</p>
          )}
          {activity.status === 'ready' && activity.items.length > 0 && (
            <ul className="divide-y divide-gray-200 border border-gray-200">
              {activity.items.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => onOpen(item.focus)}
                    className="w-full px-3 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="block text-sm font-medium text-gray-900">{item.title}</span>
                    <span className="mt-1 block text-sm text-gray-600">{item.detail}</span>
                    <span className="mt-1 block text-xs text-gray-500">{item.when}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {activity.status === 'ready' && activity.note && (
            <p className="mt-3 text-xs text-gray-500">{activity.note}</p>
          )}
        </Panel>

        <Panel title="Alerts">
          {alerts.status === 'loading' && <p className="text-sm text-gray-600">Loading…</p>}
          {alerts.status === 'error' && (
            <p className="text-sm text-red-700" role="alert">{alerts.note}</p>
          )}
          {alerts.status === 'ready' && alerts.items.length === 0 && !alerts.gap && (
            <p className="text-sm text-gray-600">No alerts from the available records.</p>
          )}
          {alerts.status === 'ready' && alerts.items.length > 0 && (
            <ul className="divide-y divide-gray-200 border border-gray-200">
              {alerts.items.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => onOpen(item.focus)}
                    className="w-full px-3 py-3 text-left text-sm text-gray-900 hover:bg-gray-50"
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {alerts.status === 'ready' && alerts.gap && (
            <p className="mt-3 text-xs text-gray-500">{alerts.gap}</p>
          )}
          {alerts.status === 'ready' && alerts.note && (
            <p className="mt-3 text-sm text-red-700" role="alert">{alerts.note}</p>
          )}
        </Panel>
      </div>

      <AdminActionQueue key={reloadKey} onOpen={onOpen} />
    </div>
  );
}
