import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { lmsService } from '../services/lmsService';
import { siteSettingsService } from '../services/siteSettingsService';
import StudentDashboardLayout from '../components/layout/StudentDashboardLayout';
import StudentDashboardRightSidebar from '../components/dashboard/StudentDashboardRightSidebar';
import StudentDashboardBanner from '../components/dashboard/StudentDashboardBanner';
import DashboardYouTubeSection from '../components/dashboard/DashboardYouTubeSection';
import StudentDashboardProgressCards from '../components/dashboard/StudentDashboardProgressCards';
import ContinueWatchingSection from '../components/dashboard/ContinueWatchingSection';
import YourMentorTable from '../components/dashboard/YourMentorTable';
import EmptyState from '../components/common/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({ enrollments: [], mentors: [] });
  const [dashboardSettings, setDashboardSettings] = useState(siteSettingsService.DASHBOARD_DEFAULTS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, settings] = await Promise.all([
        lmsService.getDashboard().catch(() => ({ enrollments: [], mentors: [] })),
        siteSettingsService.getSiteSettings().catch(() => siteSettingsService.DASHBOARD_DEFAULTS),
      ]);
      setDashboardData(data);
      setDashboardSettings({
        dashboard_banner_title: settings.dashboard_banner_title,
        dashboard_banner_cta_text: settings.dashboard_banner_cta_text,
        dashboard_banner_cta_link: settings.dashboard_banner_cta_link,
        dashboard_youtube_url: settings.dashboard_youtube_url || '',
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setDashboardData({ enrollments: [], mentors: [] });
    } finally {
      setLoading(false);
    }
  };

  const rightSidebar = (
    <StudentDashboardRightSidebar
      mentors={dashboardData.mentors}
      enrollments={dashboardData.enrollments}
    />
  );

  return (
    <StudentDashboardLayout rightSidebar={rightSidebar}>
      {loading ? (
        <div className="space-y-6">
          <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6 w-full max-w-full">
          <StudentDashboardBanner
            title={dashboardSettings.dashboard_banner_title}
            ctaText={dashboardSettings.dashboard_banner_cta_text}
            ctaLink={dashboardSettings.dashboard_banner_cta_link}
          />

          <DashboardYouTubeSection youtubeUrl={dashboardSettings.dashboard_youtube_url} />

          <StudentDashboardProgressCards enrollments={dashboardData.enrollments} />

          <ContinueWatchingSection enrollments={dashboardData.enrollments} />

          {dashboardData.mentors.length > 0 || dashboardData.enrollments.length > 0 ? (
            <YourMentorTable mentors={dashboardData.mentors} />
          ) : (
            <EmptyState
              icon="courses"
              title="No courses enrolled yet"
              description="Browse and enroll in courses to start learning and see your dashboard."
              actionLabel="Browse Courses"
              onAction={() => (window.location.href = '/courses')}
            />
          )}
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default Dashboard;
