import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { siteSettingsService } from '../services/siteSettingsService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { ErrorState, PermissionDenied } from '../components/common/DataState';
import { interpretApiError } from '../services/api';
import EnrollButton from '../components/common/EnrollButton';
import { formatPKR } from '../utils/helpers';
import { getCourseCardTheme, COURSE_CARD_ICONS } from '../utils/courseCardTheme';
import { FiClock, FiArrowLeft } from 'react-icons/fi';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, canAccessAdmin } = useAuth();
  const [course, setCourse] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const [data, settings] = await Promise.all([
        courseService.getCourseById(id),
        siteSettingsService.getSiteSettings().catch(() => ({})),
      ]);
      const subjects = settings?.subjects_items || siteSettingsService.SUBJECTS_DEFAULTS?.subjects_items || [];
      setCourse(data);
      setTheme(getCourseCardTheme(data, 0, subjects));
      setFailure(null);
    } catch (err) {
      setCourse(null);
      const interpreted = await interpretApiError(err, 'Failed to load this course');
      if (interpreted.status === 404) {
        setFailure({ kind: 'missing', message: 'This course is not available.' });
      } else {
        setFailure(interpreted);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        <p className="mt-4 text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (failure?.kind === 'denied') {
    return <PermissionDenied message={failure.message} />;
  }

  if (failure || !course) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title={failure?.kind === 'missing' ? 'Course not available' : 'Could not load this course'}
          message={failure?.message || 'This course is not available.'}
          onRetry={failure?.kind === 'missing' ? undefined : loadCourse}
        />
        <div className="text-center">
          <Button onClick={() => navigate('/courses')} variant="primary">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const bgColor = theme?.backgroundColor || '#1a2b4e';
  const IconComponent = COURSE_CARD_ICONS[theme?.iconIndex % COURSE_CARD_ICONS.length || 0];

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <FiArrowLeft />
        Back to Courses
      </button>

      <div
        className="rounded-2xl overflow-hidden shadow-lg mb-8"
        style={{ backgroundColor: bgColor }}
      >
        <div className="px-6 sm:px-10 py-10 sm:py-12 text-white relative">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center shrink-0">
              <IconComponent className="w-8 h-8" style={{ color: bgColor }} />
            </div>
            <div className="min-w-0 flex-1">
              {canAccessAdmin && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-white/20 mb-3">
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-3">{course.title}</h1>
              {theme?.subtitle && (
                <p className="text-white/90 text-base sm:text-lg mb-4">{theme.subtitle}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {course.duration_hours > 0 && (
                  <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-sm">
                    <FiClock className="w-4 h-4" />
                    {course.duration_hours} hours
                  </span>
                )}
                {course.price != null && (
                  <span className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 text-sm font-semibold">
                    {formatPKR(course.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3">About this course</h2>
        <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{course.description}</p>

        <div className="mt-8 pt-8 border-t border-gray-100">
          {isAuthenticated ? (
            <EnrollButton to={`/lms?enroll=${id}`} size="md" />
          ) : (
            <div className="rounded-xl bg-gradient-to-br from-[#0A1628] to-[#1a2b4e] text-white p-6 sm:p-8">
              <h3 className="text-xl font-bold mb-2">Start your journey with Bvonix Academy</h3>
              <p className="text-white/80 mb-6">
                Create an account or log in to enroll in this course and access hands-on training, projects, and career support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <EnrollButton to="/register" text="Sign Up & Enroll" size="md" />
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center px-6 py-3 rounded-full border border-white/30 hover:bg-white/10 font-semibold transition-colors text-sm"
                >
                  Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
