import React from 'react';
import { FiInbox, FiBook, FiFileText, FiUsers, FiBell, FiMessageSquare, FiCalendar, FiAward } from 'react-icons/fi';
import Button from './Button';

const iconMap = {
  courses: FiBook,
  assignments: FiFileText,
  students: FiUsers,
  notifications: FiBell,
  forum: FiMessageSquare,
  calendar: FiCalendar,
  scholarships: FiAward,
  default: FiInbox,
};

const EmptyState = ({
  icon = 'default',
  title = 'No items found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) => {
  const Icon = iconMap[icon] || iconMap.default;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="mb-4 p-6 bg-gray-100 rounded-full">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-primary-500 hover:bg-primary-700 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
