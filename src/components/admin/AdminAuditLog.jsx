import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import { DataState } from '../common/DataState';
import EmptyState from '../common/EmptyState';

function formatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

function stateText(value) {
  if (!value || Object.keys(value).length === 0) return 'No stored state';
  return JSON.stringify(value);
}

export default function AdminAuditLog() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);

  const load = async () => {
    setStatus('loading');
    try {
      const data = await adminService.getAuditLogs(0, 50);
      const records = data?.items || [];
      setItems(records);
      setStatus(records.length ? 'ready' : 'empty');
    } catch (error) {
      const failure = await interpretApiError(error, 'Failed to load audit logs');
      setMessage(failure.message);
      setStatus(failure.kind === 'denied' ? 'denied' : 'error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">Audit log</h2>
        <p className="mt-1 text-sm text-gray-600">
          Recent sensitive actions. Passwords and tokens are not stored.
        </p>
      </div>
      <div className="px-4 py-3">
        <DataState
          status={status}
          message={message}
          onRetry={load}
          empty={
            <EmptyState
              title="No audit records yet"
              description="Payment, enrollment, scholarship, attendance, grade, and permission changes will appear here after they happen."
            />
          }
          loading={<p className="text-sm text-gray-600">Loading audit records...</p>}
        >
          <ul className="divide-y divide-gray-200 border border-gray-200">
            {items.map((item) => (
              <li key={item.id} className="px-3 py-3">
                <p className="text-sm font-medium text-gray-900">
                  {item.action} · {item.entity_type}
                  {item.entity_id ? ` ${item.entity_id}` : ''}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {[item.actor_role, item.actor_id, formatWhen(item.created_at)].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-2 break-all text-xs text-gray-500">Previous: {stateText(item.previous_state)}</p>
                <p className="mt-1 break-all text-xs text-gray-500">New: {stateText(item.new_state)}</p>
              </li>
            ))}
          </ul>
        </DataState>
      </div>
    </section>
  );
}
