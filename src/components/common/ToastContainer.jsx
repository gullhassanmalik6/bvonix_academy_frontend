import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col space-y-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
