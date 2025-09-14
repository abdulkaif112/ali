import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from './icons/HomeIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { WalletIcon } from './icons/WalletIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UserIcon } from './icons/UserIcon';

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Transaction',
      path: '/',
      icon: HomeIcon,
      label: 'Home'
    },
    {
      name: 'History',
      path: '/history',
      icon: BookOpenIcon,
      label: 'History'
    },
    {
      name: 'Vault',
      path: '/vault',
      icon: WalletIcon,
      label: 'Vault'
    },
    {
      name: 'Summary',
      path: '/summary',
      icon: ChartBarIcon,
      label: 'Summary'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: UserIcon,
      label: 'Profile'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <IconComponent 
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : ''
                }`} 
              />
              <span className={`text-xs font-medium truncate ${
                isActive ? 'text-blue-600 dark:text-blue-400' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;