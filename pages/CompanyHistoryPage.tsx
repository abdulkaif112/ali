import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../types';

// Icons
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { TrendingDownIcon } from '../components/icons/TrendingDownIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { MinusCircleIcon } from '../components/icons/MinusCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { PrinterIcon } from '../components/icons/PrinterIcon';
import { WalletIcon } from '../components/icons/WalletIcon';
import { RupeeIcon } from '../components/icons/RupeeIcon';
import { CalendarDaysIcon } from '../components/icons/CalendarDaysIcon';
import { FilterIcon } from '../components/icons/FilterIcon';


const TransactionItem: React.FC<{
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = ({ transaction, isSelected, onSelect }) => {
  const { id, date, type, person, amount, paymentMethod } = transaction;

  const formattedDate = new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg flex items-center p-4 gap-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        checked={isSelected}
        onChange={() => onSelect(id)}
        aria-label={`Select transaction for ${person || 'N/A'}`}
      />
      {type === 'credit' ? (
        <CheckCircleIcon className="h-8 w-8 text-green-500 flex-shrink-0" />
      ) : (
        <MinusCircleIcon className="h-8 w-8 text-red-500 flex-shrink-0" />
      )}
      <div className="flex-grow truncate">
        <p className="font-semibold text-lg text-gray-800 dark:text-white truncate">{person || 'N/A'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{formattedDate}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <div className="text-right">
            <p className={`text-xl font-bold ${type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {type === 'credit' ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase">{paymentMethod}</p>
        </div>
        <Link to={`/edit/${id}`} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" aria-label="Edit transaction">
            <PencilIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

const CompanyHistoryPage: React.FC = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const [searchParams] = useSearchParams();
  const { transactions, deleteTransactionsByIds } = useAppContext();
  const navigate = useNavigate();

  // Get location filter from URL parameters
  const locationFilter = searchParams.get('location');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [filterType, setFilterType] = useState('all');


  const decodedCompanyName = companyName ? decodeURIComponent(companyName) : '';

  const companyTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => (tx.company || 'NA') === decodedCompanyName);
    
    // Apply location filter if specified in URL
    if (locationFilter) {
      filtered = filtered.filter(tx => tx.location === locationFilter);
    }
    
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, decodedCompanyName, locationFilter]);
  
  const companyLocation = companyTransactions.length > 0 ? companyTransactions[0].location : '';

  const { years, months, days } = useMemo(() => {
    const years = new Set<string>();
    const months = new Set<string>();
    const days = new Set<string>();
    companyTransactions.forEach(tx => {
        const d = new Date(tx.date);
        years.add(d.getFullYear().toString());
        if(filterYear === 'all' || d.getFullYear().toString() === filterYear) {
            months.add((d.getMonth() + 1).toString().padStart(2, '0'));
        }
        if((filterYear === 'all' || d.getFullYear().toString() === filterYear) && (filterMonth === 'all' || (d.getMonth() + 1).toString().padStart(2, '0') === filterMonth)) {
            days.add(d.getDate().toString().padStart(2, '0'));
        }
    });
    return {
        years: Array.from(years).sort((a,b) => parseInt(b) - parseInt(a)),
        months: Array.from(months).sort((a,b) => parseInt(a) - parseInt(b)),
        days: Array.from(days).sort((a,b) => parseInt(a) - parseInt(b)),
    };
  }, [companyTransactions, filterYear, filterMonth]);
  
   useEffect(() => {
    setSelectedIds([]);
  }, [searchTerm, filterYear, filterMonth, filterDay, filterType]);


  const filteredTransactions = useMemo(() => {
    return companyTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        if (filterYear !== 'all' && txDate.getFullYear().toString() !== filterYear) return false;
        if (filterMonth !== 'all' && (txDate.getMonth() + 1).toString().padStart(2, '0') !== filterMonth) return false;
        if (filterDay !== 'all' && txDate.getDate().toString().padStart(2, '0') !== filterDay) return false;
        if (filterType !== 'all' && tx.type !== filterType) return false;
        
        const searchLower = searchTerm.toLowerCase();
        if (searchTerm && !(
            tx.person?.toLowerCase().includes(searchLower) ||
            tx.amount.toString().includes(searchLower) ||
            tx.paymentMethod.toLowerCase().includes(searchLower)
        )) return false;

        return true;
    });
  }, [companyTransactions, searchTerm, filterYear, filterMonth, filterDay, filterType]);

  const filteredSummary = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
        if (tx.type === 'credit') {
            acc.totalCredit += tx.amount;
            if (tx.paymentMethod === 'cash') acc.totalCashCredit += tx.amount;
            else if (tx.paymentMethod === 'upi') acc.totalUpiCredit += tx.amount;
        } else {
            acc.totalDebit += tx.amount;
        }
        return acc;
    }, { totalCredit: 0, totalDebit: 0, totalCashCredit: 0, totalUpiCredit: 0 });
  }, [filteredTransactions]);

  const filteredNetBalance = filteredSummary.totalCredit - filteredSummary.totalDebit;

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedIds(filteredTransactions.map(tx => tx.id));
    } else {
        setSelectedIds([]);
    }
  };
  
  const handlePrint = () => navigate(`/report/${encodeURIComponent(decodedCompanyName)}`);
  const handleUpi = () => navigate('/upi-credit', { state: { companyName: decodedCompanyName, companyLocation } });
  const handleNewDebit = () => navigate('/debit-entry', { state: { companyName: decodedCompanyName, companyLocation } });
  
  const handleDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteError(null);
    setIsDeleteModalOpen(true);
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

  if (!decodedCompanyName) return <div className="text-center p-8">Company name not found.</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
          <div className="flex items-center gap-4">
              <Link to={locationFilter ? `/summary` : "/summary"} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                  <ArrowLeftIcon className="h-5 w-5"/><span>Back to Summaries</span>
              </Link>
              {locationFilter && (
                <Link 
                  to={`/company/${encodeURIComponent(decodedCompanyName)}`} 
                  className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:underline text-sm"
                >
                  Clear Location Filter
                </Link>
              )}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white w-full sm:w-auto text-center sm:text-left">
            {decodedCompanyName} History
            {locationFilter && (
              <span className="block text-sm font-normal text-blue-600 dark:text-blue-400 mt-1">
                Filtered for location: {locationFilter}
              </span>
            )}
          </h2>
          <div className="flex justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <button onClick={handleUpi} className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <span className="font-bold">₹</span> Add UPI
              </button>
              <button onClick={handleNewDebit} className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700">
                  Add Debit
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <PrinterIcon className="h-4 w-4" /> Print
              </button>
              <button onClick={handleDeleteClick} disabled={selectedIds.length === 0} className="flex items-center gap-1.5 px-3 py-2 border rounded-md text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  <TrashIcon className="h-4 w-4" /> Delete ({selectedIds.length})
              </button>
          </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center"><div className='truncate'><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Credit (Cash+Other)</p><p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1 truncate">₹{filteredSummary.totalCredit.toLocaleString('en-IN')}</p></div><div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full"><TrendingUpIcon className="h-6 w-6 text-green-600" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center"><div className='truncate'><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Debit</p><p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1 truncate">₹{filteredSummary.totalDebit.toLocaleString('en-IN')}</p><p className='text-xs text-gray-400'>{filteredTransactions.filter(t=>t.type==='debit').length} transactions</p></div><div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full"><TrendingDownIcon className="h-6 w-6 text-red-600" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center"><div className='truncate'><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Net Balance</p><p className={`text-3xl font-bold mt-1 truncate ${filteredNetBalance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>₹{filteredNetBalance.toLocaleString('en-IN')}</p></div><div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full"><StarIcon className="h-6 w-6 text-blue-600" /></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center"><div className='truncate'><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Cash Credit</p><p className="text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1 truncate">₹{filteredSummary.totalCashCredit.toLocaleString('en-IN')}</p></div><div className="bg-gray-100 dark:bg-gray-900/20 p-3 rounded-full"><WalletIcon className="h-6 w-6 text-gray-600" /></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex justify-between items-center"><div className='truncate'><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Filtered Other Credit</p><p className="text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1 truncate">₹{filteredSummary.totalUpiCredit.toLocaleString('en-IN')}</p></div><div className="bg-gray-100 dark:bg-gray-900/20 p-3 rounded-full"><RupeeIcon className="h-6 w-6 text-gray-600" /></div></div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 sticky top-[65px] z-5 no-print">
        <input type="text" placeholder="Search this company's transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-gray-50 dark:bg-gray-700" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className='relative'><CalendarDaysIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/><select value={filterYear} onChange={e => {setFilterYear(e.target.value); setFilterMonth('all'); setFilterDay('all');}} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none"><option value="all">All Years</option>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
            <div className='relative'><CalendarDaysIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/><select value={filterMonth} onChange={e => {setFilterMonth(e.target.value); setFilterDay('all');}} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none"><option value="all">All Months</option>{months.map(m=><option key={m} value={m}>{m}</option>)}</select></div>
            <div className='relative'><CalendarDaysIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/><select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none"><option value="all">All Days</option>{days.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div className='relative'><FilterIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400'/><select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full p-2 pl-10 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 appearance-none"><option value="all">All Types</option><option value="credit">Credit</option><option value="debit">Debit</option></select></div>
        </div>
        <div className="mt-4 flex items-center">
            <input type="checkbox" id="selectAll" onChange={handleSelectAll} checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="selectAll" className="ml-2 text-sm text-gray-600 dark:text-gray-300">Select/Deselect All ({selectedIds.length} of {filteredTransactions.length} selected)</label>
        </div>
      </div>

      {filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map(tx => <TransactionItem key={tx.id} transaction={tx} isSelected={selectedIds.includes(tx.id)} onSelect={handleSelect} />)}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-xl mt-4">
          <p className="text-gray-500 dark:text-gray-400">No transactions found for this company matching your criteria.</p>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete the selected <strong>{selectedIds.length}</strong> transaction(s) for <strong>{decodedCompanyName}</strong>? This will also update the cash vault for any cash transactions and cannot be undone.
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

export default CompanyHistoryPage;