export const PAGE_LIMIT = 100;
export const MAX_PAGES = 8;
export const NEW_ENROLLMENT_DAYS = 30;

export function accessFor(role) {
  const paymentAdmin = role === 'admin' || role === 'super_admin';
  return {
    paymentAdmin,
    management: paymentAdmin || role === 'academic_manager',
  };
}

export async function fetchAllPages(load) {
  const first = await load(0);
  const items = [...(first.items || [])];
  const total = typeof first.total === 'number' ? first.total : items.length;
  let pages = 1;
  while (items.length < total && pages < MAX_PAGES) {
    const page = await load(items.length);
    const next = page.items || [];
    if (next.length === 0) break;
    items.push(...next);
    pages += 1;
    if (next.length < PAGE_LIMIT) break;
  }
  return { items, total, complete: items.length >= total };
}

export function activeStudentCount(items) {
  return items.filter((student) => student.is_active !== false).length;
}

export function newEnrollmentCount(items, now, days = NEW_ENROLLMENT_DAYS) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return items.filter((enrollment) => {
    const created = new Date(enrollment.created_at).getTime();
    return Number.isFinite(created) && created >= cutoff;
  }).length;
}

export function pendingPaymentCount(items) {
  return items.filter((payment) => payment.payment_status === 'pending').length;
}

export function completedRevenue(items) {
  const totals = new Map();
  items.forEach((payment) => {
    if (payment.payment_status !== 'completed') return;
    const currency = payment.currency || '';
    const amount = Number(payment.amount);
    if (!Number.isFinite(amount)) return;
    totals.set(currency, (totals.get(currency) || 0) + amount);
  });
  return [...totals.entries()].map(([currency, amount]) => ({ currency, amount }));
}

export function completionSummary(total, completed) {
  if (!total) return { empty: true, completed: 0, total: 0, percent: null };
  const percent = Math.round((completed / total) * 1000) / 10;
  return { empty: false, completed, total, percent };
}

export function reviewCount(items) {
  return items.filter((enrollment) => (
    enrollment.workflow_state === 'receipt_uploaded' || enrollment.workflow_state === 'under_review'
  )).length;
}

export function atRiskCount(items) {
  return items.filter((scholarship) => {
    if (scholarship.status !== 'active') return false;
    const max = Number(scholarship.max_absences_per_month);
    const absences = Number(scholarship.current_month_absences);
    return max > 0 && absences >= max - 1;
  }).length;
}

export function formatMoney(amount, currency) {
  const formatted = Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return currency ? `${currency} ${formatted}` : formatted;
}

const INCOMPLETE = 'The list is longer than the pages loaded, and this API cannot filter the count. A partial number is not shown.';

export function metricFromComplete(complete, value, detail, emptyDetail) {
  if (!complete) {
    return { status: 'unavailable', value: null, detail: INCOMPLETE };
  }
  if (value === 0 && emptyDetail) {
    return { status: 'empty', value: '0', detail: emptyDetail };
  }
  return { status: 'ready', value: String(value), detail };
}

export function timestamp(record) {
  const value = record?.updated_at || record?.created_at;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}
