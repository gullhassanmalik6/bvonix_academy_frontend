import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';

const LIST_LIMIT = 100;

function formatWhen(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

function statusLabel(status) {
  if (status === 'under_review') return 'Under review';
  if (status === 'requested') return 'Requested';
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return status;
}

export default function AttendanceCorrectionList({ onOpen, courseTitle, studentLabel }) {
  const [status, setStatus] = useState('loading');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingId, setPendingId] = useState(null);
  const [notes, setNotes] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const data = await adminService.getAttendanceCorrections(0, LIST_LIMIT, { open_only: true });
        if (cancelled) return;
        const rows = data.items || [];
        setItems(rows);
        setNote(
          typeof data.total === 'number' && data.total > rows.length
            ? `Showing the first ${rows.length} of ${data.total} open correction requests.`
            : null,
        );
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const failure = await interpretApiError(err, 'Failed to load attendance corrections');
        setItems([]);
        setError(failure.message);
        setStatus(failure.kind === 'denied' ? 'denied' : 'error');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function run(id, action) {
    setPendingId(id);
    setItemErrors((current) => ({ ...current, [id]: null }));
    try {
      const noteText = notes[id] || '';
      if (action === 'review') await adminService.reviewAttendanceCorrection(id);
      if (action === 'approve') await adminService.approveAttendanceCorrection(id, noteText);
      if (action === 'reject') await adminService.rejectAttendanceCorrection(id, noteText);
      setReloadKey((value) => value + 1);
    } catch (err) {
      const failure = await interpretApiError(err, 'The correction could not be updated');
      setItemErrors((current) => ({
        ...current,
        [id]: failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message,
      }));
    } finally {
      setPendingId(null);
    }
  }

  if (status === 'loading') {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }
  if (status === 'denied') {
    return (
      <div role="alert">
        <p className="text-sm font-semibold text-amber-900">Permission denied</p>
        <p className="text-sm text-amber-800">{error}</p>
      </div>
    );
  }
  if (status === 'error') {
    return <p className="text-sm text-red-700" role="alert">{error || 'This request failed.'}</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-gray-600">No attendance corrections are waiting.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-gray-200 border border-gray-200">
        {items.map((item) => {
          const title = studentLabel ? studentLabel(item.student_id) : `Student ${String(item.student_id).slice(-6)}`;
          const course = courseTitle ? courseTitle(item.course_id) : `Course ${String(item.course_id).slice(-6)}`;
          const busy = pendingId === item.id;
          return (
            <li key={item.id} className="px-3 py-3">
              <p className="text-sm font-medium text-gray-900">
                {title} · {course}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                {item.previous_status} → {item.requested_status} · {statusLabel(item.status)}
                {item.requested_at ? ` · Requested ${formatWhen(item.requested_at)}` : ''}
              </p>
              <p className="mt-1 text-sm text-gray-700">{item.reason}</p>
              {item.status === 'under_review' && (
                <label className="mt-2 block text-sm text-gray-700">
                  Review note
                  <input
                    value={notes[item.id] || ''}
                    onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                    className="mt-1 w-full border border-gray-300 px-2 py-1"
                    maxLength={1000}
                  />
                </label>
              )}
              {itemErrors[item.id] && (
                <p className="mt-2 text-sm text-red-700" role="alert">{itemErrors[item.id]}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {item.status === 'requested' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(item.id, 'review')}
                    className="border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                  >
                    Start review
                  </button>
                )}
                {item.status === 'under_review' && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(item.id, 'approve')}
                      className="border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => run(item.id, 'reject')}
                      className="border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </>
                )}
                {onOpen && (
                  <button
                    type="button"
                    onClick={() => onOpen({ tab: 'attendance', correctionId: item.id })}
                    className="text-sm font-medium text-blue-700 underline"
                  >
                    Open attendance
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {note && <p className="mt-3 text-xs text-gray-500">{note}</p>}
    </div>
  );
}
