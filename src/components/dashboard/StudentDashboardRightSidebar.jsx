import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { siteSettingsService } from '../../services/siteSettingsService';
import {
  FiBell,
  FiMoreVertical,
  FiPlus,
  FiUser,
  FiGrid,
} from 'react-icons/fi';

const StudentDashboardRightSidebar = ({ mentors = [], enrollments = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(siteSettingsService.DASHBOARD_DEFAULTS);

  useEffect(() => {
    siteSettingsService.getSiteSettings().then((s) => {
      setSettings({
        dashboard_greeting_prefix: s.dashboard_greeting_prefix,
        dashboard_motivational_text: s.dashboard_motivational_text,
      });
    }).catch(() => {});
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';
  const greeting = `${settings.dashboard_greeting_prefix || 'Good Morning'}, ${firstName}`;
  const motivationalText = settings.dashboard_motivational_text || 'Continue Your Journey And Achieve Your Target';

  // Progress ring: ~75% complete
  const progressPercent = enrollments.length > 0
    ? Math.round(enrollments.reduce((a, e) => a + (e.progress_percentage || 0), 0) / enrollments.length)
    : 0;

  const chartBarHeights = enrollments.slice(0, 4).map((e) => Math.min(100, (e.progress_percentage || 0)));

  return (
    <div className="p-5 space-y-8">
      {/* Your Profile */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-base">Your Profile</h3>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <FiMoreVertical className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center">
          {/* Avatar with progress ring (two-tone: grey background, red arc) */}
          <div className="relative mb-4 w-24 h-24">
            <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" fill="none" stroke="#e5e7eb" strokeWidth="5" />
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="#E53935"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
              />
            </svg>
            <div className="absolute inset-2 w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-600">
                  {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <p className="font-semibold text-gray-900 text-center">{greeting}</p>
          <p className="text-sm text-gray-500 text-center mt-1 px-2">{motivationalText}</p>

          {/* Action buttons - 4 icons: bell, square+plus, user, square (matches screenshot) */}
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={() => navigate('/lms?section=announcements')}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              title="Announcements"
            >
              <FiBell className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/lms?section=available')}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              title="Available courses"
            >
              <FiPlus className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/settings?tab=profile')}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              title="Profile"
            >
              <FiUser className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/lms?section=enrollments')}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors"
              title="My courses"
            >
              <FiGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Progress chart: 4 vertical bars, each subdivided into 3 shades (darkest bottom to lightest top) */}
          {chartBarHeights.length > 0 && (
          <div className="w-full mt-5 flex items-end justify-between gap-3 h-16">
            {chartBarHeights.map((heightPercent, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-px">
                <div
                  className="w-full rounded-t-sm flex-shrink-0"
                  style={{
                    height: `${heightPercent * 0.35}%`,
                    minHeight: 8,
                    backgroundColor: '#FECACA',
                  }}
                />
                <div
                  className="w-full flex-shrink-0"
                  style={{
                    height: `${heightPercent * 0.35}%`,
                    minHeight: 8,
                    backgroundColor: '#F87171',
                  }}
                />
                <div
                  className="w-full rounded-b-sm flex-shrink-0"
                  style={{
                    height: `${heightPercent * 0.3}%`,
                    minHeight: 8,
                    backgroundColor: '#E53935',
                  }}
                />
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Your Mentor */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-base">Your Mentor</h3>
          <button
            onClick={() => navigate('/lms?section=available')}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            title="Browse courses"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4 max-h-72 overflow-y-auto">
          {mentors.length === 0 && (
            <p className="text-sm text-gray-500">Mentors appear here after you enroll in a course.</p>
          )}
          {mentors.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600">
                  {(m.name || 'M').charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
                <p className="text-xs text-gray-500 truncate">{m.specialization || 'Instructor'}</p>
              </div>
              <button
                onClick={() => navigate(m.course_id ? `/lms/course/${m.course_id}` : '/lms')}
                className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 flex-shrink-0"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/lms?section=enrollments')}
          className="w-full mt-4 py-2.5 rounded-lg bg-primary-400 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
        >
          See All
        </button>
      </div>
    </div>
  );
};

export default StudentDashboardRightSidebar;
