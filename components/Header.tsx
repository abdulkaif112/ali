import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { HomeIcon } from './icons/HomeIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UserIcon } from './icons/UserIcon';

const Header: React.FC = () => {
  const { googleSheetsConnected, syncStatus, manualSync } = useAppContext();
  const navigate = useNavigate();
  const commonClasses = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

  // Get current user (temporary - will be replaced with Firebase)
  const user = localStorage.getItem('ali_enterprises_user');
  const userData = user ? JSON.parse(user) : null;

  const handleLogout = () => {
    localStorage.removeItem('ali_enterprises_user');
    navigate('/login');
  };

  const handleManualSync = () => {
    manualSync();
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" title="Syncing to Google Sheets" />;
      case 'success':
        return <span className="w-2 h-2 bg-green-500 rounded-full" title="Synced to Google Sheets" />;
      case 'error':
        return <span className="w-2 h-2 bg-red-500 rounded-full" title="Sync failed" />;
      default:
        return googleSheetsConnected ? 
          <span className="w-2 h-2 bg-blue-500 rounded-full" title="Google Sheets connected" /> :
          <span className="w-2 h-2 bg-gray-400 rounded-full" title="Google Sheets not configured" />;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 no-print">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">ALI ENTERPRISES</h1>
              {getSyncStatusIcon()}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
                <HomeIcon />
                Transaction
              </NavLink>
              <NavLink to="/history" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
                <BookOpenIcon />
                History
              </NavLink>
              <NavLink to="/vault" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
                <BuildingStorefrontIcon />
                Vault
              </NavLink>
              <NavLink to="/summary" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
                <ChartBarIcon />
                Summary
              </NavLink>
              
              {/* User Profile Link */}
              <NavLink to="/profile" className={({ isActive }) => `${commonClasses} ${isActive ? activeClass : inactiveClass}`}>
                <UserIcon />
                Profile
              </NavLink>
              
              {/* User Info and Logout */}
              <div className="flex items-center gap-3 ml-6 pl-6 border-l border-gray-300 dark:border-gray-600">
                <button
                  onClick={handleManualSync}
                  disabled={syncStatus === 'syncing'}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/70 disabled:opacity-50 transition-colors"
                  title="Manually sync with Google Sheets"
                >
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {userData?.displayName || userData?.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;