import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../types';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { FilterIcon } from '../components/icons/FilterIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { MinusCircleIcon } from '../components/icons/MinusCircleIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { numberToWords } from '../utils/numberToWords';
import { ArrowPathIcon } from '../components/icons/ArrowPathIcon';

const HistoryPage: React.FC = () => {
  const { transactions, deleteTransactionsByIds, companyNames, locations, manualSync, syncStatus } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const mainHistoryTransactions = useMemo(() => {
    // Only show cash transactions with a breakdown on the main history page.
    // This correctly filters out UPI transactions and company-specific debits which have an empty breakdown.
    return transactions.filter(tx => 
      tx.paymentMethod === 'cash' && 
      tx.breakdown && 
      Object.keys(tx.breakdown).length > 0
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return mainHistoryTransactions.filter(tx => {
      if (filterCompany !== 'all' && (tx.company || 'NA') !== filterCompany) return false;
      if (filterLocation !== 'all' && tx.location !== filterLocation) return false;
      if (filterType !== 'all' && tx.type !== filterType) return false;
      
      const searchLower = searchTerm.toLowerCase();
      if (searchTerm && !(
          tx.person?.toLowerCase().includes(searchLower) ||
          tx.company?.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(searchLower) ||
          tx.location.toLowerCase().includes(searchLower) ||
          tx.recordedBy.toLowerCase().includes(searchLower)
      )) return false;

      return true;
    });
  }, [mainHistoryTransactions, searchTerm, filterCompany, filterLocation, filterType]);

  // Calculate totals for filtered transactions
  const totals = useMemo(() => {
    const totalCredit = filteredTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalDebit = filteredTransactions
      .filter(tx => tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const netBalance = totalCredit - totalDebit;
    
    return { totalCredit, totalDebit, netBalance };
  }, [filteredTransactions]);

  const handleDeleteClick = (ids: string[]) => {
    if (ids.length === 0) return;
    setSelectedIds(ids);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const toggleTransactionDetails = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };
  
  const handleConfirmDelete = async () => {
      setIsDeleting(true);
      setDeleteError(null);
      try {
          await deleteTransactionsByIds(selectedIds);
          setIsDeleteModalOpen(false);
          setSelectedIds([]);
      } catch (err: any) {
          setDeleteError(err.message || 'Failed to delete transactions.');
      } finally {
          setIsDeleting(false);
      }
  };

  const handleSync = async () => {
    try {
      await manualSync();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Auto-hide sync status after 5 seconds
  useEffect(() => {
    if (syncStatus === 'success' || syncStatus === 'error') {
      const timer = setTimeout(() => {
        // The sync status will be reset to 'idle' by the context
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-md transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FilterIcon className="h-4 w-4 mr-2 inline" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all ${
              syncStatus === 'syncing' ? 'animate-pulse' : ''
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>
      
      {/* Search Bar - Always Visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 mb-6">
        <input 
          type="text" 
          placeholder="Search transactions..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" 
        />
      </div>

      {/* Filters - Conditionally Visible */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className='relative'>
              <FilterIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/>
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none">
                <option value="all">All Companies</option>
                {companyNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className='relative'>
              <CalendarDaysIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/>
              <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none">
                <option value="all">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div className='relative'>
              <FilterIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none">
                <option value="all">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status Indicator */}
      {syncStatus === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300 text-sm font-medium">Successfully synced with Google Sheets</span>
          </div>
        </div>
      )}
      
      {syncStatus === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-6">
          <div className="flex items-center gap-2">
            <MinusCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-red-700 dark:text-red-300 text-sm font-medium">Sync failed. Please check your connection and try again.</span>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Credits</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totals.totalCredit.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Debits</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totals.totalDebit.toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Net Balance</p>
            <p className={`text-2xl font-bold ${totals.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {totals.netBalance < 0 ? '-' : ''}₹{Math.abs(totals.netBalance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.map((tx: Transaction) => {
          const isExpanded = expandedTransactions.has(tx.id);
          return (
            <div key={tx.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Transaction Header - Clickable */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                onClick={() => toggleTransactionDetails(tx.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {tx.type === 'credit' ? 
                      <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" /> : 
                      <MinusCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{tx.person || 'Unknown Customer'}</h3>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      tx.amount < 0 ? 'text-red-600 dark:text-red-400' : 
                      tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? 
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" /> : 
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
              </div>

              {/* Expanded Transaction Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/20">
                  <div className="space-y-4">
                    {/* Transaction ID */}
                    <div className="text-sm">
                      <span className="font-medium text-gray-600 dark:text-gray-400">ID:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-mono">{tx.id}</span>
                    </div>
                    
                    {/* Transaction Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">👤</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Customer:</span>
                        <span className="text-gray-900 dark:text-white">{tx.person || 'Unknown Customer'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">🏢</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Company:</span>
                        <span className="text-gray-900 dark:text-white">{tx.company || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">📍</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Location:</span>
                        <span className="text-gray-900 dark:text-white">{tx.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400">👨‍💼</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">Recorded By:</span>
                        <span className="text-gray-900 dark:text-white">{tx.recordedBy}</span>
                      </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📝</span>
                      <span className="font-medium text-gray-600 dark:text-gray-400">In Words:</span>
                      <span className="text-gray-900 dark:text-white italic">{numberToWords(tx.amount)}</span>
                    </div>

                    {/* Cash Denomination Breakdown */}
                    {tx.paymentMethod === 'cash' && tx.breakdown && Object.keys(tx.breakdown).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Cash Denomination Breakdown:</h4>
                        <div className="space-y-2">
                          {Object.entries(tx.breakdown)
                            .filter(([_, count]) => count > 0)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .map(([denom, count]) => (
                              <div key={denom} className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                <span className="text-gray-900 dark:text-white">
                                  ₹{denom}: <span className="font-semibold">{count} notes</span> <span className="text-gray-600 dark:text-gray-400">(₹{(parseInt(denom) * count).toLocaleString('en-IN')})</span>
                                </span>
                              </div>
                            ))
                          }
                          
                          {/* Total Cash Value */}
                          <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                Total Cash Value: ₹{tx.amount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-300 dark:border-gray-600">
                      <Link 
                        to={`/edit/${tx.id}`} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </Link>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick([tx.id]); }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filteredTransactions.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-xl mt-4">
            <p className="text-gray-500 dark:text-gray-400">No transactions match your filters.</p>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete the selected <strong>{selectedIds.length}</strong> transaction(s)? This action cannot be undone.
                </p>
                {deleteError && <div className="mt-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-2 rounded-lg text-sm">{deleteError}</div>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting} className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50">Cancel</button>
                    <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;