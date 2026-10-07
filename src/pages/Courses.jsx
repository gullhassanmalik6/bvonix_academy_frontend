import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { siteSettingsService } from '../services/siteSettingsService';
import { useAuth } from '../context/AuthContext';
import CourseCatalogCard from '../components/courses/CourseCatalogCard';
import { getCourseCardTheme } from '../utils/courseCardTheme';
import { ErrorState, PermissionDenied } from '../components/common/DataState';
import { interpretApiError } from '../services/api';
import EnrollButton from '../components/common/EnrollButton';

const CatalogSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 pl-8">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-[120px] rounded-xl bg-gray-200 animate-pulse" />
    ))}
  </div>
);

const Courses = () => {
  const { isAuthenticated, canAccessAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjectItems, setSubjectItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState(null);
  const [publishedOnly, setPublishedOnly] = useState(true);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => setSubjectItems(data?.subjects_items || []))
      .catch(() => setSubjectItems(siteSettingsService.SUBJECTS_DEFAULTS?.subjects_items || []));
  }, []);

  useEffect(() => {
    loadCourses();
  }, [publishedOnly]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params = { skip: 0, limit: 100 };
      if (publishedOnly) params.published_only = true;
      const response = await courseService.getCourses(params);
      setCourses(response.items || []);
      setFailure(null);
    } catch (err) {
      setCourses([]);
      setFailure(await interpretApiError(err, 'Failed to load courses.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="text-center mb-12 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 rounded mx-auto mb-4" />
          <div className="h-10 w-96 max-w-full bg-gray-200 rounded mx-auto mb-3" />
          <div className="h-5 w-72 max-w-full bg-gray-200 rounded mx-auto" />
        </div>
        <CatalogSkeleton />
      </div>
    );
  }

  if (failure) {
    return failure.kind === 'denied'
      ? <PermissionDenied message={failure.message} />
      : <ErrorState message={failure.message} onRetry={loadCourses} />;
  }

  return (
    <div className="pb-8">
      {/* Page header */}
      <div className="text-center mb-12 lg:mb-14">
        <p className="text-primary-500 font-bold uppercase tracking-wider text-sm mb-3">
          COURSES WE OFFER
        </p>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F1F1F] leading-tight max-w-3xl mx-auto mb-4">
          Industry-Ready Programs for Modern Careers
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
          Practical, earning-focused tech education — from Python and web development to AI, freelancing, and remote work.
        </p>

        {canAccessAdmin && (
          <label className="inline-flex items-center gap-2 mt-6 text-sm text-gray-600 bg-gray-100 rounded-lg px-4 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publishedOnly}
              onChange={(e) => setPublishedOnly(e.target.checked)}
              className="rounded accent-primary-500"
            />
            <span>Published only</span>
          </label>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-gray-50 border border-gray-100">
          <p className="text-gray-900 text-lg font-medium">No courses are published yet.</p>
          <p className="text-gray-500 text-sm mt-2">
            {isAuthenticated
              ? 'Check back after an administrator publishes a course, or open My Learning if you are already enrolled.'
              : 'Check back soon, or create an account so you can enroll when a course opens.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 pl-8 sm:pl-10">
          {courses.map((course, index) => (
            <CourseCatalogCard
              key={course.id}
              course={course}
              theme={getCourseCardTheme(course, index, subjectItems)}
              showAdminMeta={canAccessAdmin}
            />
          ))}
        </div>
      )}

      {!isAuthenticated && courses.length > 0 && (
        <div className="mt-16 text-center rounded-2xl bg-gradient-to-br from-[#0A1628] to-[#1a2b4e] text-white px-6 py-10">
          <h2 className="text-2xl font-bold mb-2">Ready to enroll?</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Admissions are open. Get hands-on training, internship support, and career guidance at Bvonix Academy.
          </p>
          <EnrollButton to="/register" size="md" className="mx-auto" />
        </div>
      )}
    </div>
  );
};

export default Courses;
