import React, { useEffect } from 'react';
import { FiCheck, FiX, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.autoClose) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const icons = {
    success: FiCheck,
    error: FiX,
    warning: FiAlertTriangle,
    info: FiInfo,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-primary-600',
  };

  const Icon = icons[toast.type] || FiInfo;

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in-right ${colors[toast.type] || colors.info}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type] || iconColors.info}`} />
      <div className="flex-1">
        {toast.title && (
          <p className="font-semibold text-sm mb-1">{toast.title}</p>
        )}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
