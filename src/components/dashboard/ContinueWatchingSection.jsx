import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiHeart, FiPlay } from 'react-icons/fi';
import { getFileUrl } from '../../services/api';

const ContinueWatchingSection = ({ enrollments = [] }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) {
      const amount = 320;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const displayItems = enrollments.slice(0, 6);

  if (displayItems.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Continue Watching</h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayItems.map((e) => {
          const progress = Math.min(100, Math.max(0, e.progress_percentage ?? 0));
          return (
            <div
              key={e.id}
              className="flex-shrink-0 w-72 bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/lms/course/${e.course_id}`)}
            >
              {/* Video thumbnail */}
              <div className="relative h-36 bg-gray-800 flex items-center justify-center overflow-hidden">
                {e.thumbnail_url || e.image_url ? (
                  <img
                    src={String(e.thumbnail_url || e.image_url).startsWith('http') ? (e.thumbnail_url || e.image_url) : getFileUrl(e.thumbnail_url || e.image_url)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-4xl text-gray-500">📚</span>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <FiPlay className="w-6 h-6 text-primary-500 ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary-200 text-primary-800 text-xs font-medium rounded-full">
                  {e.instructor_specialization || 'FRONTEND'}
                </span>
                <button
                  onClick={(ev) => { ev.stopPropagation(); }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-600"
                >
                  <FiHeart className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600">
                  {e.course_title}
                </h4>
                {/* Progress bar - like screenshot */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold flex-shrink-0">
                    {(e.instructor_name || 'I').charAt(0)}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {e.instructor_name}, {e.instructor_specialization || 'Instructor'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContinueWatchingSection;
