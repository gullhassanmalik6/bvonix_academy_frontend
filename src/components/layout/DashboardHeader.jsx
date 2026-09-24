import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SiteLogo from './SiteLogo';
import { notificationService } from '../../services/notificationService';
import SearchModal from '../common/SearchModal';
import {
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiMenu,
} from 'react-icons/fi';

const DashboardHeader = ({ onMenuToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notificationsData, unreadData] = await Promise.all([
        notificationService.getNotifications(true, 10).catch(() => []),
        notificationService.getUnreadCount().catch(() => ({ unread_count: 0 }))
      ]);
      setNotifications(notificationsData || []);
      setUnreadCount(unreadData?.unread_count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Group notifications by priority and type
  const groupedNotifications = () => {
    const groups = {
      urgent: [],
      important: [],
      normal: [],
    };

    notifications.forEach(notification => {
      // Determine priority based on notification type or content
      let priority = notification.priority || 'normal';
      if (priority === 'high') priority = 'important';
      if (notification.title?.toLowerCase().includes('urgent')) priority = 'urgent';
      
      if (priority === 'urgent') {
        groups.urgent.push(notification);
      } else if (priority === 'important') {
        groups.important.push(notification);
      } else {
        groups.normal.push(notification);
      }
    });

    return groups;
  };

  const notificationGroups = groupedNotifications();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Menu Toggle & Logo */}
          <div className="flex items-center space-x-4">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
                aria-label="Toggle menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center">
              <SiteLogo variant="light" />
            </div>
          </div>

          {/* Search trigger - opens modal (also Ctrl+K) */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex-1 max-w-sm mx-4 hidden md:flex items-center gap-2 px-4 py-2 text-left text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiSearch className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-sm truncate">Search courses, students...</span>
            <kbd className="ml-auto hidden lg:inline-flex px-2 py-0.5 text-xs bg-white rounded border border-gray-300">Ctrl+K</kbd>
          </button>

          {/* Right Section: Notifications & User Menu */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={showNotifications}
                aria-haspopup="true"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span 
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
                    aria-label={`${unreadCount} unread notifications`}
                  ></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  role="menu"
                  aria-label="Notifications menu"
                >
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900" id="notifications-heading">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FiBell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div>
                        {/* Urgent Notifications */}
                        {notificationGroups.urgent.length > 0 && (
                          <div className="border-b border-red-200 bg-red-50">
                            <div className="px-4 py-2 bg-red-100 border-b border-red-200">
                              <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">Urgent</p>
                            </div>
                            {notificationGroups.urgent.map((notification) => (
                              <div
                                key={notification.id}
                                className="p-4 hover:bg-red-100 cursor-pointer transition-colors border-b border-red-100"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-red-500"></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-red-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-red-700 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-red-600 mt-2">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Important Notifications */}
                        {notificationGroups.important.length > 0 && (
                          <div className="border-b border-yellow-200">
                            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
                              <p className="text-xs font-semibold text-yellow-800 uppercase tracking-wider">Important</p>
                            </div>
                            {notificationGroups.important.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-yellow-50 cursor-pointer transition-colors ${
                                  !notification.is_read ? 'bg-yellow-50' : ''
                                }`}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                    notification.is_read ? 'bg-transparent' : 'bg-yellow-500'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Normal Notifications */}
                        {notificationGroups.normal.length > 0 && (
                          <div className="divide-y divide-gray-100">
                            {notificationGroups.normal.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.is_read ? 'bg-primary-50' : ''
                                }`}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                    notification.is_read ? 'bg-transparent' : 'bg-primary-500'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => navigate('/lms')}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={`User menu for ${user?.full_name || user?.email}`}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Administrator' : 'Student'}
                  </p>
                </div>
                <FiChevronDown className={`w-4 h-4 text-gray-600 transition-transform hidden sm:block ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded" aria-label="Administrator">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" role="separator"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
    </header>
  );
};

export default DashboardHeader;
