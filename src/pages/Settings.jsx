import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { settingsService } from '../services/settingsService';
import StudentDashboardLayout from '../components/layout/StudentDashboardLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { FiUser, FiBell, FiLock, FiMail, FiSave, FiTrash2 } from 'react-icons/fi';
import { FormSkeleton } from '../components/common/Skeleton';
import { ErrorState, PermissionDenied } from '../components/common/DataState';
import { interpretApiError } from '../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    requestedTab === 'notifications' || requestedTab === 'security' || requestedTab === 'profile'
      ? requestedTab
      : 'profile'
  );
  const [loading, setLoading] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [settingsFailure, setSettingsFailure] = useState(null);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    scholarship_alerts: true,
    assignment_reminders: true,
    course_updates: true,
  });

  // Security settings
  const [securityData, setSecurityData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile' || tab === 'notifications' || tab === 'security') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      setSearchParams({ tab: 'profile' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const loadSettings = async () => {
    try {
      setLoadingPreferences(true);
      const [profileData, notificationPrefs] = await Promise.all([
        settingsService.getProfile(),
        settingsService.getNotificationPreferences(),
      ]);
      setSettingsFailure(null);

      if (profileData) {
        setProfileData({
          full_name: profileData.full_name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
        });
      }

      if (notificationPrefs) {
        setNotifications({
          email_notifications: notificationPrefs.email_notifications ?? true,
          push_notifications: notificationPrefs.push_notifications ?? true,
          scholarship_alerts: notificationPrefs.scholarship_alerts ?? true,
          assignment_reminders: notificationPrefs.assignment_reminders ?? true,
          course_updates: notificationPrefs.course_updates ?? true,
        });
      }
    } catch (error) {
      setSettingsFailure(await interpretApiError(error, 'Failed to load settings'));
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await settingsService.updateProfile({
        full_name: profileData.full_name,
        phone: profileData.phone,
      });
      toast.success('Profile updated successfully!', { duration: 2000 });
      if (updateUser) {
        updateUser({ ...user, full_name: profileData.full_name });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      await settingsService.updateNotificationPreferences(notifications);
      toast.success('Notification preferences updated!', { duration: 2000 });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update preferences', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityData.new_password !== securityData.confirm_password) {
      toast.error('Passwords do not match', { duration: 3000 });
      return;
    }
    if (securityData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters', { duration: 3000 });
      return;
    }
    setLoading(true);
    try {
      await settingsService.changePassword(
        securityData.current_password,
        securityData.new_password
      );
      toast.success('Password changed successfully!', { duration: 3000 });
      setSecurityData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await settingsService.deleteAccount();
      toast.success('Your account has been deleted', { duration: 3000 });
      if (logout) {
        logout();
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete account', { duration: 4000 });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <StudentDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 text-lg">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => selectTab('profile')}
            className={`shrink-0 min-h-11 px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiUser className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => selectTab('notifications')}
            className={`shrink-0 min-h-11 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiBell className="inline mr-2" />
            Notifications
          </button>
          <button
            onClick={() => selectTab('security')}
            className={`shrink-0 min-h-11 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiLock className="inline mr-2" />
            Security
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          settingsFailure ? (
            settingsFailure.kind === 'denied'
              ? <PermissionDenied message={settingsFailure.message} />
              : <ErrorState message={settingsFailure.message} onRetry={loadSettings} />
          ) : loadingPreferences ? (
            <FormSkeleton />
          ) : (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    name="settings-full-name"
                    label="Full Name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    name="settings-email"
                    label="Email Address"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Input
                    type="tel"
                    name="settings-phone"
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </div>
            </form>
          </Card>
          )
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          settingsFailure ? (
            settingsFailure.kind === 'denied'
              ? <PermissionDenied message={settingsFailure.message} />
              : <ErrorState message={settingsFailure.message} onRetry={loadSettings} />
          ) : loadingPreferences ? (
            <FormSkeleton />
          ) : (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.email_notifications}
                    onChange={(e) => setNotifications({ ...notifications, email_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.push_notifications}
                    onChange={(e) => setNotifications({ ...notifications, push_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Scholarship Alerts</h3>
                  <p className="text-sm text-gray-500">Get notified about scholarship status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.scholarship_alerts}
                    onChange={(e) => setNotifications({ ...notifications, scholarship_alerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Assignment Reminders</h3>
                  <p className="text-sm text-gray-500">Reminders for upcoming assignments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.assignment_reminders}
                    onChange={(e) => setNotifications({ ...notifications, assignment_reminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-gray-900">Course Updates</h3>
                  <p className="text-sm text-gray-500">Notifications about course announcements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.course_updates}
                    onChange={(e) => setNotifications({ ...notifications, course_updates: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNotificationUpdate}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </Card>
          )
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <Input
                    type="password"
                    name="settings-current-password"
                    label="Current Password"
                    value={securityData.current_password}
                    onChange={(e) => setSecurityData({ ...securityData, current_password: e.target.value })}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="settings-new-password"
                    label="New Password"
                    value={securityData.new_password}
                    onChange={(e) => setSecurityData({ ...securityData, new_password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="settings-confirm-password"
                    label="Confirm New Password"
                    value={securityData.confirm_password}
                    onChange={(e) => setSecurityData({ ...securityData, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="mt-8 border-t border-red-200 pt-6">
              <h3 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">
                Deleting your account is permanent. All your data may be removed and you will no longer be able to access the LMS.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  deleting 
                    ? 'bg-red-400 cursor-not-allowed opacity-50' 
                    : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                } text-white`}
              >
                <FiTrash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting account...' : 'Delete my account'}</span>
              </button>
            </div>
          </Card>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default Settings;
