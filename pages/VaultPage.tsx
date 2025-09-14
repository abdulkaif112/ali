

import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { DENOMINATIONS } from '../constants';

const VaultPage: React.FC = () => {
  const { vault } = useAppContext();

  const totalVaultValue = useMemo(() => {
    return DENOMINATIONS.reduce((sum, denom) => sum + (vault[denom] || 0) * denom, 0);
  }, [vault]);
  
  const sortedDenominations = useMemo(() => {
    return [...DENOMINATIONS].sort((a, b) => b - a);
  },[]);


  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Cash Vault</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mb-8">
        <div className="text-center">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Vault Value</h3>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                ₹ {totalVaultValue.toLocaleString('en-IN')}
            </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Denomination Breakdown</h3>
        <div className="space-y-4">
            {sortedDenominations.map(denom => {
                const count = vault[denom] || 0;
                const value = count * denom;
                // Show all denominations, including zero and negative counts

                return (
                    <div key={denom} className={`flex items-center justify-between p-4 rounded-lg ${
                        count === 0 
                            ? 'bg-gray-100 dark:bg-gray-700/30' 
                            : count < 0 
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}>
                        <div className="flex items-center">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 w-20">₹ {denom}</span>
                            <span className="text-gray-500 dark:text-gray-400 mx-4">x</span>
                            <span className={`text-lg font-medium w-24 ${
                                count < 0 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : count === 0 
                                        ? 'text-gray-400 dark:text-gray-500'
                                        : 'text-gray-800 dark:text-gray-200'
                            }`}>
                                {count.toLocaleString('en-IN')} {count === 1 ? 'note' : 'notes'}
                                {count < 0 && ' (shortage)'}
                            </span>
                        </div>
                        <div className={`text-lg font-semibold ${
                            count < 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : count === 0 
                                    ? 'text-gray-400 dark:text-gray-500'
                                    : 'text-gray-900 dark:text-white'
                        }`}>
                            {value < 0 ? '-' : ''}₹ {Math.abs(value).toLocaleString('en-IN')}
                        </div>
                    </div>
                );
            })}
             {totalVaultValue === 0 && Object.values(vault).every(count => count === 0) && (
                <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                  The vault is empty. Add a credit transaction to get started.
                </p>
             )}
        </div>
      </div>
    </div>
  );
};

export default VaultPage;