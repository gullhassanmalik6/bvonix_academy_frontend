import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay } from 'react-icons/fi';

/** Banner - text + Join Now only. YouTube displays separately in course content below. */
const StudentDashboardBanner = ({ title, ctaText, ctaLink = '/courses' }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 p-6 sm:p-8 mb-6 w-full max-w-full">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2l2.4 7.2H22l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z' fill='%23ffffff' fill-opacity='0.8'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/90 mb-2 block">ONLINE COURSE</span>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
          {title || 'Sharpen Your Skills With Professional Online Courses'}
        </h2>
        <button
          onClick={() => navigate(ctaLink)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-white text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
        >
          <FiPlay className="w-4 h-4" />
          {ctaText || 'Join Now'}
        </button>
      </div>
    </div>
  );
};

export default StudentDashboardBanner;
