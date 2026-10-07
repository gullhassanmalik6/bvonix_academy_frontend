import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminRoleLabel } from '../../navigation/adminAccess';
import SiteLogo from './SiteLogo';
import { FiUser, FiLogOut } from 'react-icons/fi';

const Header = () => {
  const { isAuthenticated, user, logout, canAccessAdmin } = useAuth();
  const roleLabel = adminRoleLabel(user?.role);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center min-w-0 shrink">
            <SiteLogo variant="light" className="max-w-[6.5rem] sm:max-w-none" />
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6 shrink-0 text-sm sm:text-base" aria-label="Site">
            <Link to="/" className="hidden sm:inline text-gray-700 hover:text-primary-500 transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-primary-500 transition-colors whitespace-nowrap">
              Courses
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/lms?section=enrollments"
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                >
                  My Learning
                </Link>
                {canAccessAdmin && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-primary-500 transition-colors font-semibold"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FiUser className="text-gray-600" />
                    <span className="text-gray-700">{user?.full_name || user?.email}</span>
                    {roleLabel && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        {roleLabel}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary whitespace-nowrap inline-flex items-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
