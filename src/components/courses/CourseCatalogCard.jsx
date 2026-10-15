import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiArrowRight } from 'react-icons/fi';
import { COURSE_CARD_ICONS } from '../../utils/courseCardTheme';
import { formatPKR } from '../../utils/helpers';
import { getFileUrl } from '../../services/api';

/**
 * @param {'browse' | 'enroll'} mode - browse links to detail page; enroll shows Enroll Now action
 */
const CourseCatalogCard = ({ course, theme, showAdminMeta = false, mode = 'browse', onEnroll }) => {
  const IconComponent = COURSE_CARD_ICONS[theme.iconIndex % COURSE_CARD_ICONS.length];
  const description = theme.subtitle || course.description || '';

  const cardBody = (
    <article
      className={`relative flex items-stretch rounded-xl shadow-md min-h-[130px] overflow-visible transition-all duration-300 h-full ${
        mode === 'browse' ? 'group-hover:-translate-y-1 group-hover:shadow-xl' : 'hover:-translate-y-1 hover:shadow-xl'
      }`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center shrink-0 z-10 border border-white/80 overflow-hidden">
        {course.image_url ? (
          <img src={getFileUrl(course.image_url)} alt="" className="w-full h-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
        ) : (
          <IconComponent className="w-7 h-7" style={{ color: theme.backgroundColor }} />
        )}
      </div>

      <div className="pl-10 pr-5 py-5 flex flex-col flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug pr-2">
          {course.title}
        </h2>
        <p className="text-white/90 text-sm leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>
        <p className="text-white/80 text-xs mt-1">Instructor: {course.instructor_name || 'Instructor not assigned'}</p>

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-white/85 text-xs sm:text-sm flex-wrap">
            {course.duration_hours > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1">
                <FiClock className="w-3.5 h-3.5" />
                {course.duration_hours} hrs
              </span>
            )}
            {course.price != null && (
              <span className="inline-flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-1 font-semibold">
                {formatPKR(course.price)}
              </span>
            )}
          </div>

          {mode === 'browse' ? (
            <span className="inline-flex items-center gap-1 text-white text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
              Learn more
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onEnroll?.(course.id)}
              className="inline-flex items-center gap-1.5 bg-white text-sm font-semibold rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: theme.backgroundColor }}
            >
              Enroll Now
              <FiArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {mode === 'enroll' && (
          <Link
            to={`/courses/${course.id}`}
            className="mt-3 inline-flex items-center gap-1 text-xs text-white/75 hover:text-white transition-colors w-fit"
            onClick={(e) => e.stopPropagation()}
          >
            View course details
            <FiArrowRight className="w-3 h-3" />
          </Link>
        )}

        {showAdminMeta && (
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/75">
            <span className={`px-2 py-0.5 rounded-full ${course.is_published ? 'bg-white/25' : 'bg-black/20'}`}>
              {course.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        )}
      </div>
    </article>
  );

  if (mode === 'enroll') {
    return <div className="h-full">{cardBody}</div>;
  }

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
    >
      {cardBody}
    </Link>
  );
};

export default CourseCatalogCard;
