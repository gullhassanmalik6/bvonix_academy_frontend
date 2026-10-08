import { useCallback, useState } from 'react';
import Button from './Button';
import EmptyState from './EmptyState';
import { CardSkeleton, FormSkeleton, ListSkeleton, TableSkeleton } from './Skeleton';
import { interpretApiError } from '../../services/api';

export function LoadingState({ variant = 'list', label = 'Loading' }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {variant === 'card' && <CardSkeleton />}
      {variant === 'form' && <FormSkeleton />}
      {variant === 'table' && <TableSkeleton />}
      {variant === 'list' && <ListSkeleton />}
    </div>
  );
}

export function ErrorState({ title = 'Could not load this data', message, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
      <h3 className="text-base font-semibold text-red-800">{title}</h3>
      {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
      {onRetry && (
        <Button type="button" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}

export function PermissionDenied({ message = 'You do not have permission to view this.' }) {
  return (
    <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center">
      <h3 className="text-base font-semibold text-amber-900">Permission denied</h3>
      <p className="mt-1 text-sm text-amber-800">{message}</p>
    </div>
  );
}

export function DataState({ status, message, onRetry, empty, loading, children }) {
  if (status === 'loading') return loading || <LoadingState />;
  if (status === 'denied') return <PermissionDenied message={message} />;
  if (status === 'error') return <ErrorState message={message} onRetry={onRetry} />;
  if (status === 'empty') {
    return empty || (
      <EmptyState
        title="Nothing here yet"
        description="There is nothing to show yet."
      />
    );
  }
  return children;
}

export function useCollectionView() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const start = useCallback(() => {
    setStatus('loading');
    setMessage('');
  }, []);

  const succeed = useCallback((items) => {
    setMessage('');
    setStatus(items && items.length > 0 ? 'ready' : 'empty');
  }, []);

  const fail = useCallback(async (error, fallback) => {
    const failure = await interpretApiError(error, fallback);
    setStatus(failure.kind === 'denied' ? 'denied' : 'error');
    setMessage(failure.message);
  }, []);

  return { status, message, start, succeed, fail };
}
