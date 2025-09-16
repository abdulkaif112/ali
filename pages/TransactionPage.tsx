// Implementing the TransactionPage component
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { NoteCounts, TransactionType } from '../types';
import { DENOMINATIONS } from '../constants';
import CurrencyCounter from '../components/CurrencyCounter';
import { UserIcon } from '../components/icons/UserIcon';
import { BuildingOfficeIcon } from '../components/icons/BuildingOfficeIcon';
import { MapPinIcon } from '../components/icons/MapPinIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { TrendingDownIcon } from '../components/icons/TrendingDownIcon';

const TransactionPage: React.FC = () => {
  const { addTransaction, companyNames, locations } = useAppContext();

  // Get current user
  const user = localStorage.getItem('ali_enterprises_user');
  const userData = user ? JSON.parse(user) : null;
  const currentUserName = userData?.displayName || userData?.email || 'Unknown User';

  // State for form fields
  const [transactionType, setTransactionType] = useState<TransactionType>('credit');
  const [person, setPerson] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [recordedBy, setRecordedBy] = useState(currentUserName);
  const [breakdown, setBreakdown] = useState<NoteCounts>({});

  // Update recordedBy when user changes
  useEffect(() => {
    setRecordedBy(currentUserName);
  }, [currentUserName]);

  // State for submission handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalAmount = useMemo(() => {
    return DENOMINATIONS.reduce((sum, denom) => sum + (breakdown[denom] || 0) * denom, 0);
  }, [breakdown]);

  const resetForm = () => {
    setPerson('');
    setCompany('');
    setLocation('');
    setBreakdown({});
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError("Location is a required field.");
      return;
    }


    setError(null);
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await addTransaction({
        type: transactionType,
        paymentMethod: 'cash',
        company: company || 'NA',
        person: person,
        location: location,
        recordedBy: recordedBy,
        amount: totalAmount,
        notes: '', // No notes field in the new design
        breakdown,
      });
      setSuccessMessage(`Transaction of ₹${totalAmount.toLocaleString('en-IN')} recorded successfully!`);
      resetForm();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const submitButtonText = `Submit Cash ${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}`;

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name (Optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" name="customerName" id="customerName" value={person} onChange={e => setPerson(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700" placeholder="Enter customer's name" />
          </div>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name (Optional)</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select id="companyName" name="companyName" value={company} onChange={e => setCompany(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700 appearance-none">
              <option value="">Select Company Name</option>
              {companyNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select id="location" name="location" value={location} onChange={e => setLocation(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-700 appearance-none" required>
              <option value="">Select Location</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>



        <hr className="border-gray-200 dark:border-gray-700" />

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cash Denominations</h3>
          <CurrencyCounter value={breakdown} onChange={setBreakdown} />
        </div>

        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Total Transaction Amount: ₹{totalAmount.toLocaleString('en-IN')}
          </h3>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Type</label>
          <fieldset className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input type="radio" id="credit" name="transactionType" value="credit" checked={transactionType === 'credit'} onChange={() => setTransactionType('credit')} className="sr-only peer" />
              <label htmlFor="credit" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500 transition-all">
                <TrendingUpIcon className="h-5 w-5 text-green-500" />
                <span>Credit</span>
              </label>
            </div>
            <div className="relative">
              <input type="radio" id="debit" name="transactionType" value="debit" checked={transactionType === 'debit'} onChange={() => setTransactionType('debit')} className="sr-only peer" />
              <label htmlFor="debit" className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer peer-checked:border-red-500 peer-checked:ring-2 peer-checked:ring-red-500 transition-all">
                <TrendingDownIcon className="h-5 w-5 text-red-500" />
                <span>Debit</span>
              </label>
            </div>
          </fieldset>
        </div>

        <div>
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isSubmitting ? 'Saving...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionPage;
