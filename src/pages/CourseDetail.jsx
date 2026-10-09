import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { siteSettingsService } from '../services/siteSettingsService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { ErrorState, PermissionDenied } from '../components/common/DataState';
import { getFileUrl, interpretApiError } from '../services/api';
import EnrollButton from '../components/common/EnrollButton';
import { formatPKR } from '../utils/helpers';
import { getCourseCardTheme, COURSE_CARD_ICONS } from '../utils/courseCardTheme';
import { FiClock, FiArrowLeft } from 'react-icons/fi';

const LESSON_TYPES = {
  video: 'Video',
  document: 'Document',
  link: 'Link',
  assignment_instruction: 'Instructions',
};

const WORK_TYPES = {
  homework: 'Homework',
  project: 'Project',
  quiz: 'Quiz',
  exam: 'Exam',
};

function Unavailable({ children }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function EnrollmentActions({ isAuthenticated, courseId, size = 'lg', includeLogin = true }) {
  const enroll = isAuthenticated ? (
    <EnrollButton
      to={`/lms?enroll=${courseId}`}
      text="Enroll Now"
      size={size}
      className="w-full justify-between"
    />
  ) : (
    <EnrollButton
      to="/register"
      text="Sign Up & Enroll"
      size={size}
      className="w-full justify-between"
    />
  );

  if (isAuthenticated || !includeLogin) {
    return enroll;
  }

  return (
    <div className="space-y-3">
      {enroll}
      <Link
        to="/login"
        className="flex w-full items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
      >
        Login
      </Link>
    </div>
  );
}

function instructorLines(instructor) {
  if (!instructor) return [];
  const lines = [];
  if (instructor.name) lines.push(instructor.name);
  if (instructor.specialization) lines.push(instructor.specialization);
  if (instructor.years_of_experience != null) {
    lines.push(`${instructor.years_of_experience} years of experience`);
  }
  if (instructor.bio) lines.push(instructor.bio);
  return lines;
}

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, canAccessAdmin, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [decision, setDecision] = useState(null);
  const [decisionFailure, setDecisionFailure] = useState(null);
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const [data, settings] = await Promise.all([
        courseService.getCourseById(id),
        siteSettingsService.getSiteSettings().catch(() => ({})),
      ]);
      let nextDecision = null;
      let nextDecisionFailure = null;
      if (data.is_published) {
        try {
          nextDecision = await courseService.getCourseDecision(id);
        } catch (err) {
          nextDecisionFailure = await interpretApiError(err, 'Could not load lessons and practical work');
        }
      }
      const subjects = settings?.subjects_items || siteSettingsService.SUBJECTS_DEFAULTS?.subjects_items || [];
      setCourse(data);
      setDecision(nextDecision);
      setDecisionFailure(nextDecisionFailure);
      setTheme(getCourseCardTheme(data, 0, subjects));
      setFailure(null);
    } catch (err) {
      setCourse(null);
      setDecision(null);
      setDecisionFailure(null);
      const interpreted = await interpretApiError(err, 'Failed to load this course');
      if (interpreted.status === 404) {
        setFailure({ kind: 'missing', message: 'This course is not available.' });
      } else {
        setFailure(interpreted);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (authLoading) return;
    loadCourse();
  }, [authLoading, isAuthenticated, loadCourse]);

  useEffect(() => {
    if (!course) return undefined;
    const apply = () => {
      const pad = window.innerWidth < 1024 ? '5.5rem' : '';
      document.querySelectorAll('footer').forEach((node) => {
        node.style.paddingBottom = pad;
      });
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      document.querySelectorAll('footer').forEach((node) => {
        node.style.paddingBottom = '';
      });
    };
  }, [course]);

  if (loading) {
    return (
      <div className="text-center py-12" aria-busy="true">
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
  const description = (course.description || '').trim();
  const fee = course.price != null ? formatPKR(course.price) : '';
  const instructorFacts = instructorLines(decision?.instructor);
  const lessons = decision?.lessons || [];
  const practical = decision?.practical_work || [];
  const unpublishedNote = 'This course is not published yet, so lesson and project titles are not listed here.';

  return (
    <div className="max-w-6xl mx-auto pb-28 lg:pb-8">
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <FiArrowLeft />
        Back to Courses
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 lg:gap-8 items-start">
        <div className="space-y-6 order-2 lg:order-1">
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: bgColor }}>
            <div className="px-6 sm:px-10 py-10 sm:py-12 text-white">
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
                    <p className="text-white/90 text-base sm:text-lg">{theme.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Section title="What students learn">
            {description ? (
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{description}</p>
            ) : (
              <Unavailable>A description has not been added for this course.</Unavailable>
            )}
          </Section>

          <Section title="Curriculum">
            {decisionFailure ? (
              <ErrorState message={decisionFailure.message} onRetry={loadCourse} />
            ) : !course.is_published ? (
              <Unavailable>{unpublishedNote}</Unavailable>
            ) : lessons.length === 0 ? (
              <Unavailable>No published lessons are listed for this course yet.</Unavailable>
            ) : (
              <>
                <ol className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <li key={`${lesson.order}-${lesson.title}-${index}`} className="rounded-xl border border-gray-100 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{lesson.title}</span>
                        <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                          {LESSON_TYPES[lesson.material_type] || lesson.material_type}
                        </span>
                        {lesson.is_required && (
                          <span className="text-xs rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">Required</span>
                        )}
                        {lesson.duration_minutes > 0 && (
                          <span className="text-xs text-gray-500">{lesson.duration_minutes} min</span>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{lesson.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
                {decision.lesson_total > lessons.length && (
                  <p className="mt-3 text-sm text-gray-500">
                    Showing {lessons.length} of {decision.lesson_total} published lessons.
                  </p>
                )}
              </>
            )}
          </Section>

          <Section title="Projects and practical work">
            {decisionFailure ? (
              <Unavailable>Practical work could not be loaded.</Unavailable>
            ) : !course.is_published ? (
              <Unavailable>{unpublishedNote}</Unavailable>
            ) : practical.length === 0 ? (
              <Unavailable>No published projects or practical work are listed for this course yet.</Unavailable>
            ) : (
              <>
                <ul className="space-y-3">
                  {practical.map((item, index) => (
                    <li key={`${item.assignment_type}-${item.title}-${index}`} className="rounded-xl border border-gray-100 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                        <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                          {WORK_TYPES[item.assignment_type] || item.assignment_type}
                        </span>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{item.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
                {decision.practical_total > practical.length && (
                  <p className="mt-3 text-sm text-gray-500">
                    Showing {practical.length} of {decision.practical_total} published items.
                  </p>
                )}
              </>
            )}
          </Section>

          <Section title="Career outcomes">
            <Unavailable>Career outcomes are not listed for this course.</Unavailable>
          </Section>
        </div>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
            {course.image_url ? (
              <img src={getFileUrl(course.image_url)} alt="" className="mb-4 w-full h-40 object-cover rounded-xl bg-gray-100" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="mb-4 w-full h-24 rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">No course image</div>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fee</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {fee || <span className="text-lg font-medium text-gray-500">Not listed</span>}
            </p>
            <div className="mt-5">
              <EnrollmentActions isAuthenticated={isAuthenticated} courseId={id} />
            </div>
            {!isAuthenticated && (
              <p className="mt-3 text-sm text-gray-500">Create an account to enroll in this course.</p>
            )}

            <dl className="mt-6 border-t border-gray-100">
              <div className="py-3 border-b border-gray-100">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {course.duration_hours > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      {course.duration_hours} hours
                    </span>
                  ) : (
                    <span className="text-gray-500">Duration has not been set for this course.</span>
                  )}
                </dd>
              </div>
              <div className="py-3 border-b border-gray-100">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Level</dt>
                <dd className="mt-1"><Unavailable>Level is not listed for this course.</Unavailable></dd>
              </div>
              <div className="py-3 border-b border-gray-100">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery mode</dt>
                <dd className="mt-1">
                  <Unavailable>
                    Delivery mode is not listed for this course. The enrollment form asks you to choose online or physical.
                  </Unavailable>
                </dd>
              </div>
              <div className="py-3 border-b border-gray-100">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Instructor</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {decisionFailure ? (
                    <Unavailable>Instructor details could not be loaded.</Unavailable>
                  ) : instructorFacts.length > 0 ? (
                    <div className="space-y-1">
                      {instructorFacts.map((line, index) => (
                        <p key={`${index}-${line}`} className="whitespace-pre-line">{line}</p>
                      ))}
                    </div>
                  ) : (
                    <Unavailable>An instructor is not listed for this course.</Unavailable>
                  )}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Certificate</dt>
                <dd className="mt-1">
                  <Unavailable>
                    Certificate details are not listed for this course. An administrator can issue a certificate after a student finishes.
                  </Unavailable>
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-gray-500">Fee</p>
            <p className="text-sm font-bold text-gray-900">{fee || 'Not listed'}</p>
          </div>
          <div className="min-w-0 flex-1">
            <EnrollmentActions isAuthenticated={isAuthenticated} courseId={id} size="sm" includeLogin={false} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
