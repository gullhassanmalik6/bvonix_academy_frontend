import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiBook, FiFileText, FiHome, FiUser } from 'react-icons/fi';
import { notificationService } from '../../services/notificationService';
import { interpretApiError } from '../../services/api';
import { DataState } from '../common/DataState';
import { isStudentMobileNavActive, studentMobileNavigation } from '../../navigation/studentNavigation';

const ICONS = {
  home: FiHome,
  learn: FiBook,
  assignments: FiFileText,
  notifications: FiBell,
  profile: FiUser,
};

const formatTimeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const StudentMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [failure, setFailure] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [location.pathname, location.search]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [items, unread] = await Promise.all([
        notificationService.getNotifications(false, 20),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(items || []);
      setUnreadCount(unread?.unread_count || 0);
      setFailure(null);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      setFailure(await interpretApiError(error, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    if (!media.matches) return undefined;
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  const openNotifications = () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) loadNotifications();
  };

  const markRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      setFailure(await interpretApiError(error, 'Failed to update notification'));
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      setFailure(await interpretApiError(error, 'Failed to update notifications'));
    }
  };

  const items = studentMobileNavigation();

  return (
    <>
      {notificationsOpen && (
        <div className="lg:hidden fixed inset-0 z-30" >
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close notifications"
            onClick={() => setNotificationsOpen(false)}
          />
          <section
            id="student-notifications"
            role="region"
            aria-label="Notifications"
            className="absolute inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] max-h-[70vh] bg-white rounded-t-2xl shadow-xl border border-gray-200 flex flex-col"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="min-h-11 px-2 text-sm font-medium text-primary-600"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-500">Loading notifications...</p>
              ) : failure ? (
                <div className="p-4">
                  <DataState
                    status={failure.kind === 'denied' ? 'denied' : 'error'}
                    message={failure.message}
                    onRetry={loadNotifications}
                  />
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <FiBell className="w-10 h-10 mx-auto mb-2 text-gray-300" aria-hidden="true" />
                  <p className="font-medium text-gray-700">No notifications</p>
                  <p className="text-sm mt-1">Announcements and alerts will show up here.</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => (
                    <li key={notification.id} className="border-b border-gray-100 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        className={`w-full text-left px-4 py-3 min-h-11 ${notification.is_read ? 'bg-white' : 'bg-primary-50'}`}
                      >
                        <p className="text-sm font-medium text-gray-900 break-words">{notification.title}</p>
                        {notification.message && (
                          <p className="text-sm text-gray-600 mt-1 break-words">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(notification.created_at)}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}

      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]"
        aria-label="Student"
      >
        <ul className="grid grid-cols-5">
          {items.map((item) => {
            const Icon = ICONS[item.id] || FiHome;
            const active = item.id === 'notifications'
              ? notificationsOpen
              : isStudentMobileNavActive(item.id, location);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.id === 'notifications') {
                      openNotifications();
                      return;
                    }
                    setNotificationsOpen(false);
                    navigate(item.path);
                  }}
                  aria-current={active ? 'page' : undefined}
                  aria-expanded={item.id === 'notifications' ? notificationsOpen : undefined}
                  aria-controls={item.id === 'notifications' ? 'student-notifications' : undefined}
                  className={`relative w-full min-h-16 flex flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium ${
                    active ? 'text-primary-500' : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute top-2 right-[calc(50%-1.4rem)] min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[1.1rem] text-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default StudentMobileNav;
