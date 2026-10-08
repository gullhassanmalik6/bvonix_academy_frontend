import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isStudentNavActive } from '../../navigation/studentNavigation';
import {
  FiGrid,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiBook,
  FiAward,
  FiCreditCard,
  FiUsers,
  FiUser,
  FiUserCheck,
  FiClipboard,
  FiSettings,
  FiLogOut,
  FiHome,
} from 'react-icons/fi';

const Sidebar = ({ menuItems = [], title = "Navigation", onLogout, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const groups = (Array.isArray(menuItems) ? menuItems : []).filter(
    (entry) => entry?.group && Array.isArray(entry.items),
  );
  
  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] === false,
    }));
  };

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const iconMap = {
    overview: FiHome,
    courses: FiBook,
    enrollments: FiClipboard,
    users: FiUsers,
    instructors: FiUserCheck,
    students: FiUser,
    attendance: FiUserCheck,
    scholarships: FiAward,
    payments: FiCreditCard,
    'site-settings': FiSettings,
  };

  const itemIsActive = (item) => {
    if (item.path) return isStudentNavActive(item.path, location);
    return Boolean(item.activeTab && item.activeTab === item.id);
  };


  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-screen shadow-lg`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <FiGrid className="text-white text-xl" />
            <span className="font-bold text-white text-lg">{title}</span>
          </div>
        )}
        {isCollapsed && (
          <FiGrid className="text-white text-xl mx-auto" />
        )}
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg hover:bg-primary-800 transition-colors text-white"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <FiChevronRight className="w-4 h-4" />
          ) : (
            <FiChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4" role="navigation" aria-label="Main navigation">
        {groups.length > 0 ? (
          groups.map((entry) => {
            const groupKey = entry.group;
            const isExpanded = expandedGroups[groupKey] !== false;

            if (isCollapsed) {
              return entry.items.length > 0 ? (
                <button
                  key={groupKey}
                  onClick={() => handleItemClick(entry.items[0])}
                  className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  title={groupKey}
                >
                  <FiGrid className="text-xl flex-shrink-0 text-gray-600" />
                </button>
              ) : null;
            }

            return (
              <div key={groupKey} className="mb-1">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {groupKey}
                  </span>
                  {isExpanded ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-2 border-l-2 border-gray-100">
                    {entry.items.map((subItem) => {
                      const Icon = iconMap[subItem.id] || FiGrid;
                      const isActive = itemIsActive(subItem);

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => handleItemClick(subItem)}
                          className={`
                            w-full flex items-center px-4 py-2.5 text-left transition-all duration-200
                            ${isActive
                              ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500 font-medium'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <Icon className={`text-lg flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-600'}`} />
                          <span className={`ml-3 text-sm ${isActive ? 'text-primary-600 font-medium' : 'text-gray-700'}`}>
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-4 py-2 text-gray-500 text-sm">No menu items</div>
        )}
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded transition-colors"
            title={isCollapsed ? "Logout" : ""}
          >
            <FiLogOut className="text-xl flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
