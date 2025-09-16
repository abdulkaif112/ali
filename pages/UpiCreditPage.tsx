import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserIcon } from '../components/icons/UserIcon';
import { ArrowLeftIcon } from '../components/icons/ArrowLeftIcon';

const UpiCreditPage: React.FC = () => {
  const { addTransaction } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const { companyName, companyLocation } = location.state || {};

  // Get current user
  const user = localStorage.getItem('ali_enterprises_user');
  const userData = user ? JSON.parse(user) : null;
  const currentUserName = userData?.displayName || userData?.email || 'Unknown User';

  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyName || !companyLocation) {
      navigate('/summary');
    }
  }, [companyName, companyLocation, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setIsSubmitting(true);

    try {
      await addTransaction({
        type: 'credit',
        paymentMethod: 'upi',
        company: companyName,
        person: person || 'N/A',
        location: companyLocation,
        recordedBy: currentUserName,
        amount: Number(amount),
        notes: 'UPI Transaction',
        breakdown: {},
      });
      navigate(`/company/${encodeURIComponent(companyName)}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  if (!companyName) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`/company/${encodeURIComponent(companyName)}`} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
          <ArrowLeftIcon className="h-5 w-5"/>
          <span>Back</span>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add UPI Credit for {companyName}</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
        {error && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                {error}
            </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
            <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-200">{companyName}</p>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-gray-200">{companyLocation}</p>
          </div>
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name (Optional)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                <input type="text" name="customerName" id="customerName" value={person} onChange={e => setPerson(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" placeholder="Enter customer's name" />
            </div>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 sm:text-sm">₹</span></div>
                <input type="number" name="amount" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="block w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700" placeholder="0.00" required />
            </div>
          </div>
          <div>
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit UPI Credit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpiCreditPage;