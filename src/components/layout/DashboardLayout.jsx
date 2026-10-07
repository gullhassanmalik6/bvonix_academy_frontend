import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import Breadcrumb from '../common/Breadcrumb';

const DashboardLayout = ({ children, menuItems = [], title = "Navigation", showLogout = true }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // If no menu items, render without sidebar
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <DashboardHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <DashboardHeader 
        onMenuToggle={handleMenuToggle}
        isSidebarCollapsed={isCollapsed}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`hidden lg:block transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } h-full`}>
          <Sidebar 
            menuItems={menuItems} 
            title={title}
            onLogout={showLogout ? handleLogout : null}
            onCollapseChange={setIsCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="fixed left-0 top-16 bottom-0 z-50 lg:hidden w-64">
              <Sidebar 
                menuItems={menuItems} 
                title={title}
                onLogout={showLogout ? handleLogout : null}
                onCollapseChange={(collapsed) => {
                  setIsCollapsed(collapsed);
                  if (!collapsed) setIsMobileMenuOpen(false);
                }}
              />
            </div>
          </>
        )}

        {/* Main Content. The sidebar is already in the flex row, so this column must not add another left margin. min-w-0 lets it shrink on a phone instead of being clipped. */}
        <div className="flex-1 min-w-0 overflow-x-auto transition-all duration-300">
          <main className="p-4 sm:p-6 lg:p-8 bg-[#F5F5F5] min-h-full">
            <Breadcrumb />
            {children || <div className="text-gray-500 p-4">No content available</div>}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
