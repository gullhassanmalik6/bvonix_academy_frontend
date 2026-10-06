import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { siteSettingsService } from '../../services/siteSettingsService';
import SearchModal from '../common/SearchModal';
import { isStudentNavActive, studentMobileMoreNavigation, studentNavigation } from '../../navigation/studentNavigation';
import StudentMobileNav from './StudentMobileNav';
import {
  FiHome,
  FiBook,
  FiFileText,
  FiVideo,
  FiFile,
  FiBarChart2,
  FiCalendar,
  FiCreditCard,
  FiAward,
  FiBell,
  FiMessageSquare,
  FiUser,
  FiUserCheck,
  FiStar,
  FiPlusCircle,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiFilter,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

// Logo: four-point star/cross in solid circle (Bvonix red)
const LogoIcon = () => (
  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  </div>
);

const StudentDashboardLayout = ({ children, rightSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [dashboardSettings, setDashboardSettings] = useState(siteSettingsService.DASHBOARD_DEFAULTS);

  useEffect(() => {
    siteSettingsService.getSiteSettings().then((s) => {
      setDashboardSettings({
        dashboard_banner_title: s.dashboard_banner_title,
        dashboard_banner_cta_text: s.dashboard_banner_cta_text,
        dashboard_banner_cta_link: s.dashboard_banner_cta_link,
        dashboard_greeting_prefix: s.dashboard_greeting_prefix,
        dashboard_motivational_text: s.dashboard_motivational_text,
        dashboard_search_placeholder: s.dashboard_search_placeholder || 'Search your course here...',
        dashboard_friends_items: s.dashboard_friends_items || [],
      });
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navIcons = {
    dashboard: FiHome,
    enrollments: FiBook,
    assignments: FiFileText,
    sessions: FiVideo,
    materials: FiFile,
    available: FiPlusCircle,
    calendar: FiCalendar,
    performance: FiBarChart2,
    attendance: FiUserCheck,
    certificates: FiStar,
    payments: FiCreditCard,
    scholarships: FiAward,
    announcements: FiBell,
    forum: FiMessageSquare,
    profile: FiUser,
    settings: FiSettings,
  };

  const navigation = studentNavigation();
  const mobileMoreNavigation = studentMobileMoreNavigation();

  const friendsItems = dashboardSettings.dashboard_friends_items || [];

  const onNavClick = () => setIsMobileMenuOpen(false);

  const sidebarContent = (closeOnNav = false, { showBrand = true, entries = navigation, showFriends = true } = {}) => (
    <>
      {showBrand && (
        <div className="pt-6 pb-5 px-5 flex items-center gap-3">
          <LogoIcon />
          <span className="font-bold text-gray-800 text-lg uppercase tracking-tight">BVONIX ACADEMY</span>
        </div>
      )}

      <div className="px-5 pt-2">
        {entries.map((entry) => {
          if (entry.group) {
            return (
              <div key={entry.group} className="pt-4 first:pt-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">{entry.group}</p>
                <div className="space-y-0.5">
                  {entry.items.map((item) => {
                    const Icon = navIcons[item.id] || FiBook;
                    const isActive = isStudentNavActive(item.path, location);
                    return (
                      <button
                        key={item.id}
                        onClick={() => { navigate(item.path); if (closeOnNav) onNavClick(); }}
                        className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          isActive ? 'text-primary-500 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-primary-500' : 'text-gray-700'}`}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          const Icon = navIcons[entry.id] || FiHome;
          const isActive = isStudentNavActive(entry.path, location);
          return (
            <button
              key={entry.id}
              onClick={() => { navigate(entry.path); if (closeOnNav) onNavClick(); }}
              className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                isActive ? 'text-primary-500 bg-primary-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-primary-500' : 'text-gray-700'}`}>{entry.label}</span>
            </button>
          );
        })}
      </div>

      {showFriends && (
      <div className="px-5 pt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">FRIENDS</p>
        <div className="space-y-3">
          {friendsItems.length > 0 ? (
            friendsItems.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {f.avatar_url ? (
                    <img src={f.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">{(f.name || 'F').charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800 truncate">{f.name}</p>
                  <p className="text-xs text-gray-500 truncate">{f.role}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No contacts have been added yet.</p>
          )}
        </div>
      </div>
      )}

      <div className="px-5 pt-6 pb-6">
        <button
          onClick={() => { handleLogout(); if (closeOnNav) onNavClick(); }}
          className="w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiLogOut className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm font-medium text-red-600">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col lg:flex-row lg:gap-4 lg:px-4 lg:py-4">
      {/* Left Sidebar - collapsible on desktop */}
      {leftSidebarOpen && (
        <aside className="hidden lg:flex flex-col flex-shrink-0 w-64 bg-white rounded-2xl shadow-lg overflow-hidden lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] relative">
          <nav className="flex-1 overflow-y-auto flex flex-col min-h-0 scrollbar-hide">
            {sidebarContent(false)}
          </nav>
          <button
            onClick={() => setLeftSidebarOpen(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 z-10"
            title="Hide sidebar"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Toggle button when left sidebar is hidden */}
      {!leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-600 hover:bg-gray-50 z-30"
          title="Show sidebar"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 h-screen w-64 bg-white z-50 lg:hidden shadow-xl rounded-r-2xl overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <LogoIcon />
                <span className="font-bold text-gray-800 uppercase">BVONIX ACADEMY</span>
              </div>
              <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="min-h-11 min-w-11 inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg" aria-label="Close menu">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="overflow-y-auto scrollbar-hide pb-24" aria-label="More student sections">
              {sidebarContent(true, { showBrand: false, entries: mobileMoreNavigation, showFriends: false })}
            </nav>
          </aside>
        </>
      )}

      {/* Main content: header + course content - flex-1 expands when sidebars hidden */}
      <div
        className={`flex-1 flex flex-col min-w-0 py-4 lg:py-4 overflow-hidden transition-all ${
          !leftSidebarOpen ? 'pl-12 lg:pl-12' : 'pl-4'
        } ${rightSidebar && !rightSidebarOpen ? 'pr-12 lg:pr-12' : 'pr-4'}`}
      >
        {/* Header - search bar and icons */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-20">
          <div className="flex items-center gap-3 w-full max-w-full">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0"
              aria-label="More learning sections"
              aria-expanded={isMobileMenuOpen}
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex-1 min-w-0 min-h-11 flex items-center gap-3 px-4 bg-gray-100 rounded-xl text-left text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="flex-1 truncate text-sm">
                {dashboardSettings.dashboard_search_placeholder || 'Search your course here...'}
              </span>
              <FiFilter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
            <button
              onClick={() => navigate('/lms?section=announcements')}
              className="hidden lg:inline-flex p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 flex-shrink-0"
              title="Announcements"
              aria-label="Announcements"
            >
              <FiBell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main content - Banner, YouTube, Progress, etc. - BELOW header */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-6 bg-white min-h-0">
          {children}
        </main>
      </div>

      {/* Right Sidebar - collapsible on desktop */}
      {rightSidebar && rightSidebarOpen && (
        <aside className="hidden lg:flex flex-col flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-y-auto border border-gray-100 lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] scrollbar-hide relative">
          {rightSidebar}
          <button
            onClick={() => setRightSidebarOpen(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 z-10"
            title="Hide sidebar"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Toggle button when right sidebar is hidden */}
      {rightSidebar && !rightSidebarOpen && (
        <button
          onClick={() => setRightSidebarOpen(true)}
          className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center text-gray-600 hover:bg-gray-50 z-30"
          title="Show sidebar"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
      )}

      <StudentMobileNav />
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </div>
  );
};

export default StudentDashboardLayout;
