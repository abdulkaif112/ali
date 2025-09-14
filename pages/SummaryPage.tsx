import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UsersIcon } from '../components/icons/UsersIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';

interface FilteredSummary {
  displayName: string;
  companyName: string;
  totalCredit: number;
  totalDebit: number;
  netBalance: number;
  transactionCount: number;
}
// Fix: Define explicit types for the reduce accumulator to fix type inference issues.
interface SummaryAccumulatorValue {
  displayName: string;
  companyName: string;
  totalCredit: number;
  totalDebit: number;
  transactionCount: number;
}
type SummaryAccumulator = { [key: string]: SummaryAccumulatorValue };

const SummaryPage: React.FC = () => {
  const { transactions, locations } = useAppContext();
  const [selectedLocation, setSelectedLocation] = useState('all');

  const sortedLocations = useMemo(() => [...locations].sort(), [locations]);

  const filteredSummaries = useMemo(() => {
    const relevantTransactions =
      selectedLocation === 'all'
        ? transactions
        : transactions.filter(tx => tx.location === selectedLocation);

    const summariesByGroup = relevantTransactions.reduce<SummaryAccumulator>((acc, tx) => {
      const companyName = tx.company || 'NA';
      const groupKey = `${companyName} ${tx.location}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          displayName: groupKey,
          companyName: companyName,
          totalCredit: 0,
          totalDebit: 0,
          transactionCount: 0,
        };
      }

      if (tx.type === 'credit') {
        acc[groupKey].totalCredit += tx.amount;
      } else {
        acc[groupKey].totalDebit += tx.amount;
      }
      acc[groupKey].transactionCount += 1;
      return acc;
    }, {});

    return Object.values(summariesByGroup)
      .map((summary: SummaryAccumulatorValue) => ({
        ...summary,
        netBalance: summary.totalCredit - summary.totalDebit,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [transactions, selectedLocation]);

  const getCompanyUrl = (companyName: string) => {
    const encodedName = encodeURIComponent(companyName);
    if (selectedLocation === 'all') {
      return `/company/${encodedName}`;
    } else {
      return `/company/${encodedName}?location=${encodeURIComponent(selectedLocation)}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-6">
            <div className="flex items-center gap-3">
                <UsersIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Company Balances</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Balances based on transactions you have recorded.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
            <button
                onClick={() => setSelectedLocation('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedLocation === 'all'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
                All Your Locations
            </button>
            {sortedLocations.map(location => {
                const isActive = selectedLocation === location;
                return (
                    <button
                        key={location}
                        onClick={() => setSelectedLocation(location)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {location}
                    </button>
                );
            })}
        </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Company Name
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Credits
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Debits
                </th>
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Net Balance
                </th>
                <th scope="col" className="px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSummaries.map((summary: FilteredSummary) => (
                <tr key={summary.displayName} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <Link to={getCompanyUrl(summary.companyName)} className="hover:underline">
                      {summary.displayName} ({summary.transactionCount})
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                    ₹{summary.totalCredit.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                    ₹{summary.totalDebit.toLocaleString('en-IN')}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${summary.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600'}`}>
                    {summary.netBalance < 0 ? '-' : ''}₹{Math.abs(summary.netBalance).toLocaleString('en-IN')}
                  </td>
                   <td className="px-6 py-4 text-right">
                     <Link to={getCompanyUrl(summary.companyName)} className="text-gray-400 hover:text-gray-600">
                        <ChevronRightIcon className="h-5 w-5" />
                     </Link>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filteredSummaries.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-xl mt-4">
            <p className="text-gray-500 dark:text-gray-400">No company data to display for the selected location.</p>
        </div>
      )}
    </div>
  );
};

export default SummaryPage;