import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMoreVertical } from 'react-icons/fi';

const StudentDashboardProgressCards = ({ enrollments = [] }) => {
  const navigate = useNavigate();
  const displayItems = enrollments.slice(0, 3);

  if (displayItems.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {displayItems.map((e) => (
        <div
          key={e.id}
          className="bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/lms/course/${e.course_id}`)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-200/80 rounded-lg flex-shrink-0">
              <FiBell className="w-5 h-5 text-primary-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">
                {e.watched_count ?? 0}/{e.total_materials ?? 0} Watched
              </p>
              <p className="text-xs text-gray-500 truncate">
                {e.instructor_specialization || 'Course'}
              </p>
            </div>
          </div>
          <button
            onClick={(ev) => { ev.stopPropagation(); }}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 flex-shrink-0"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default StudentDashboardProgressCards;
