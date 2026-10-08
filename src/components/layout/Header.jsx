import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminRoleLabel } from '../../navigation/adminAccess';
import SiteLogo from './SiteLogo';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const linkClass = 'text-gray-700 hover:text-primary-500 transition-colors whitespace-nowrap';

const Header = () => {
  const { isAuthenticated, user, logout, canAccessAdmin } = useAuth();
  const roleLabel = adminRoleLabel(user?.role);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
  ];
  if (isAuthenticated) {
    links.push(
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/lms?section=enrollments', label: 'My Learning' },
    );
    if (canAccessAdmin) {
      links.push({ to: '/admin', label: 'Admin Panel', className: 'font-semibold' });
    }
  }

  const account = isAuthenticated ? (
    <>
      <div className="flex items-center gap-2 min-w-0">
        <FiUser className="text-gray-600 shrink-0" aria-hidden="true" />
        <span className="text-gray-700 truncate max-w-[12rem]">{user?.full_name || user?.email}</span>
        {roleLabel && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded shrink-0">
            {roleLabel}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
      >
        <FiLogOut aria-hidden="true" />
        <span>Logout</span>
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className={linkClass}>
        Login
      </Link>
      <Link
        to="/register"
        className="btn btn-primary whitespace-nowrap inline-flex items-center"
      >
        Sign Up
      </Link>
    </>
  );

  return (
    <header className="w-full bg-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center gap-4 min-h-16 py-3">
          <Link to="/" className="flex items-center shrink-0">
            <SiteLogo variant="light" className="whitespace-nowrap" />
          </Link>

          <nav
            className="hidden lg:flex flex-1 items-center gap-6 min-w-0 text-base"
            aria-label="Site"
          >
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${linkClass} ${item.className || ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 shrink-0 ml-auto">
            {account}
          </div>

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center min-h-11 min-w-11 ml-auto rounded-lg text-gray-700 hover:bg-gray-100"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX className="w-5 h-5" aria-hidden="true" /> : <FiMenu className="w-5 h-5" aria-hidden="true" />}
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="site-menu" className="lg:hidden border-t border-gray-200">
          <nav className="flex flex-col gap-1 px-4 py-3 sm:px-6" aria-label="Site">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-2 py-2 rounded-lg hover:bg-gray-50 ${linkClass} ${item.className || ''}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col items-start gap-3 border-t border-gray-100 px-2 pt-3">
              {account}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
