import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiHome, FiChevronRight } from 'react-icons/fi';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const Breadcrumb = ({ items = [], customLabels = {} }) => {
  const location = useLocation();
  const params = useParams();
  const { breadcrumbItems: contextItems } = useBreadcrumb();

  // Auto-generate breadcrumbs from route if items not provided
  const generateBreadcrumbs = () => {
    // Priority: props items > context items > auto-generated
    if (items.length > 0) return items;
    if (contextItems.length > 0) return contextItems;

    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard', icon: FiHome }
    ];

    let currentPath = '';
    pathnames.forEach((name, index) => {
      currentPath += `/${name}`;
      
      // Map route segments to readable labels
      const labelMap = {
        'dashboard': 'Dashboard',
        'lms': 'My LMS',
        'course': 'Course',
        'admin': 'Admin Dashboard',
        'courses': 'Courses',
        'enrollments': 'Enrollments',
        'settings': 'Settings',
        'profile': 'Profile',
        ...customLabels
      };

      // Check if this is a dynamic route parameter (like :id)
      let label = labelMap[name];
      
      // If it's a dynamic parameter, try to get custom label or use param value
      if (!label && params[name]) {
        label = customLabels[params[name]] || params[name];
      }
      
      // Fallback to formatted name
      if (!label) {
        label = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
      }
      
      // Don't add link for current page (last item)
      const isLast = index === pathnames.length - 1;
      
      breadcrumbs.push({
        label,
        href: isLast ? null : currentPath,
        icon: null
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb if only on home
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <FiChevronRight className="mx-2 text-gray-400 w-4 h-4" aria-hidden="true" />
              )}
              {isLast ? (
                <span className="flex items-center text-gray-900 font-medium">
                  {Icon && <Icon className="mr-1.5 w-4 h-4" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href || '#'}
                  className="flex items-center text-gray-600 hover:text-primary-500 transition-colors"
                >
                  {Icon && <Icon className="mr-1.5 w-4 h-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
