import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserIcon } from '../components/icons/UserIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { TrendingDownIcon } from '../components/icons/TrendingDownIcon';
import { StarIcon } from '../components/icons/StarIcon';

const UserProfilePage: React.FC = () => {
  const { transactions } = useAppContext();
  
  // Get current user
  const user = localStorage.getItem('ali_enterprises_user');
  const userData = user ? JSON.parse(user) : null;
  const currentUserName = userData?.displayName || userData?.email || 'Unknown User';
  
  const [userStats, setUserStats] = useState({
    totalTransactions: 0,
    totalCredits: 0,
    totalDebits: 0,
    netBalance: 0,
    firstTransactionDate: '',
    companiesWorkedWith: 0,
    locationsWorkedIn: 0
  });

  useEffect(() => {
    if (transactions.length > 0) {
      const credits = transactions.filter(tx => tx.type === 'credit');
      const debits = transactions.filter(tx => tx.type === 'debit');
      
      const totalCredits = credits.reduce((sum, tx) => sum + tx.amount, 0);
      const totalDebits = debits.reduce((sum, tx) => sum + tx.amount, 0);
      
      const companies = new Set(transactions.map(tx => tx.company).filter(c => c && c !== 'NA'));
      const locations = new Set(transactions.map(tx => tx.location).filter(l => l && l !== 'NA'));
      
      const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setUserStats({
        totalTransactions: transactions.length,
        totalCredits,
        totalDebits,
        netBalance: totalCredits - totalDebits,
        firstTransactionDate: sortedTransactions[0]?.date || '',
        companiesWorkedWith: companies.size,
        locationsWorkedIn: locations.size
      });
    }
  }, [transactions]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your transaction activity and statistics</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
            <UserIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUserName}</h3>
            <p className="text-gray-600 dark:text-gray-400">{userData?.email || 'No email available'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Member since: {formatDate(userStats.firstTransactionDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalTransactions}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
              <CalendarDaysIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Credits</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(userStats.totalCredits)}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Debits</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(userStats.totalDebits)}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
              <TrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
              <p className={`text-3xl font-bold ${userStats.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>
                {formatCurrency(userStats.netBalance)}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <StarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Companies worked with:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{userStats.companiesWorkedWith}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Locations worked in:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{userStats.locationsWorkedIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average transaction:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(userStats.totalTransactions > 0 ? (userStats.totalCredits + userStats.totalDebits) / userStats.totalTransactions : 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">User ID:</span>
              <span className="font-mono text-sm text-gray-900 dark:text-white">{userData?.uid || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Account type:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {userData?.uid?.startsWith('google_') ? 'Google Account' : 'Email Account'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data privacy:</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">Your data only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Privacy Notice */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
            <UserIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h5 className="font-semibold text-blue-900 dark:text-blue-200">Data Privacy</h5>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              You can only see transactions recorded by your account. All data is filtered by your login credentials to ensure privacy and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;