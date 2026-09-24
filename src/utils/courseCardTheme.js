import {
  FiZap,
  FiLayers,
  FiCode,
  FiBook,
  FiSmartphone,
  FiCpu,
  FiMessageCircle,
  FiSettings,
  FiTrendingUp,
  FiGlobe,
  FiDollarSign,
} from 'react-icons/fi';

export const COURSE_CARD_PALETTE = [
  '#3776AB',
  '#E44D26',
  '#6366F1',
  '#3DDC84',
  '#8B5CF6',
  '#A855F7',
  '#0EA5E9',
  '#F97316',
  '#14B8A6',
  '#64748B',
  '#EC4899',
  '#4F46E5',
];

export const COURSE_CARD_ICONS = [
  FiCode,
  FiLayers,
  FiZap,
  FiSmartphone,
  FiCpu,
  FiMessageCircle,
  FiSettings,
  FiTrendingUp,
  FiGlobe,
  FiDollarSign,
  FiBook,
  FiZap,
];

/**
 * Match a course to site-settings subject item for consistent colors/copy.
 */
export function getCourseCardTheme(course, index, subjectItems = []) {
  const title = (course?.title || '').toLowerCase();

  const match = subjectItems.find((item) => {
    const subjectTitle = (item?.title || '').toLowerCase();
    if (!subjectTitle) return false;
    return title === subjectTitle || title.includes(subjectTitle) || subjectTitle.includes(title);
  });

  if (match) {
    return {
      backgroundColor: match.background_color || COURSE_CARD_PALETTE[index % COURSE_CARD_PALETTE.length],
      subtitle: match.subtitle || null,
      iconIndex: index,
    };
  }

  return {
    backgroundColor: COURSE_CARD_PALETTE[index % COURSE_CARD_PALETTE.length],
    subtitle: null,
    iconIndex: index,
  };
}
